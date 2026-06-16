-- Run this in Supabase SQL Editor to create the RPC

CREATE OR REPLACE FUNCTION create_booking_transaction(
    p_user_id UUID,
    p_studio_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_equipments JSONB -- Format: [{"equipment_id": "uuid", "quantity": 1}]
) RETURNS jsonb AS $$
DECLARE
    v_pending_count INT;
    v_studio RECORD;
    v_studio_group_hash INT8;
    v_overlapping_booking UUID;
    v_equipment_rec RECORD;
    v_eq_lock_hash INT8;
    v_eq_db RECORD;
    v_used_quantity INT;
    v_studio_price NUMERIC;
    v_equipment_price NUMERIC := 0;
    v_total_price NUMERIC;
    v_deposit_amount NUMERIC;
    v_duration_hours NUMERIC;
    v_booking_code TEXT;
    v_booking_id UUID;
    v_eq_json JSONB;
BEGIN
    -- 1. Kiểm tra Rate Limit (Giới hạn tối đa 3 booking pending)
    SELECT COUNT(*) INTO v_pending_count
    FROM bookings
    WHERE user_id = p_user_id AND status = 'pending_payment';
    
    IF v_pending_count >= 3 THEN
        RAISE EXCEPTION 'LIMIT_REACHED';
    END IF;

    -- Lấy thông tin studio
    SELECT * INTO v_studio FROM studios WHERE id = p_studio_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'STUDIO_NOT_FOUND';
    END IF;

    -- 2. Advisory Lock cho nhóm phòng theo ngày
    -- Tạo mã hash int8 từ text: 'MAIN_STUDIO_CLUSTER_' || date_trunc('day', p_start_time)
    -- Do tất cả các phòng O/C/Full House xung đột nhau, ta dùng chung 1 chuỗi giả định là 'MAIN_STUDIO_CLUSTER'
    v_studio_group_hash := hashtext('MAIN_STUDIO_CLUSTER_' || TO_CHAR(p_start_time, 'YYYY-MM-DD'));
    PERFORM pg_advisory_xact_lock(v_studio_group_hash);

    -- 3. Kiểm tra Overlap logic
    SELECT b.id INTO v_overlapping_booking
    FROM bookings b
    JOIN studios s ON s.id = b.studio_id
    WHERE b.status IN ('pending_payment', 'confirmed')
      AND b.start_time < p_end_time 
      AND b.end_time > p_start_time
      AND (
          b.studio_id = p_studio_id
          OR (v_studio.code IN ('O', 'C') AND s.code = 'FULL')
          OR (v_studio.code = 'FULL' AND s.code IN ('O', 'C'))
      )
    LIMIT 1;

    IF v_overlapping_booking IS NOT NULL THEN
        RAISE EXCEPTION 'SLOT_CONFLICT';
    END IF;

    -- 4. Xử lý thiết bị (nếu có)
    IF p_equipments IS NOT NULL AND jsonb_array_length(p_equipments) > 0 THEN
        FOR v_eq_json IN SELECT * FROM jsonb_array_elements(p_equipments)
        LOOP
            -- Lấy Lock cho thiết bị này theo ngày
            v_eq_lock_hash := hashtext('EQ_' || (v_eq_json->>'equipment_id') || '_' || TO_CHAR(p_start_time, 'YYYY-MM-DD'));
            PERFORM pg_advisory_xact_lock(v_eq_lock_hash);

            -- Lấy thông tin thiết bị
            SELECT * INTO v_eq_db FROM equipments WHERE id = (v_eq_json->>'equipment_id')::UUID;
            IF NOT FOUND THEN
                RAISE EXCEPTION 'EQUIPMENT_NOT_FOUND';
            END IF;

            -- Tính số lượng đang được dùng trong khung giờ này
            SELECT COALESCE(SUM(be.quantity), 0) INTO v_used_quantity
            FROM booking_equipments be
            JOIN bookings b ON b.id = be.booking_id
            WHERE be.equipment_id = v_eq_db.id
              AND b.status IN ('pending_payment', 'confirmed')
              AND b.start_time < p_end_time 
              AND b.end_time > p_start_time;

            -- Kiểm tra
            IF (v_used_quantity + (v_eq_json->>'quantity')::INT) > v_eq_db.total_quantity THEN
                RAISE EXCEPTION 'EQUIPMENT_OUT_OF_STOCK';
            END IF;

            -- Cộng tiền thiết bị
            v_equipment_price := v_equipment_price + (v_eq_db.price * (v_eq_json->>'quantity')::INT);
        END LOOP;
    END IF;

    -- 5. Tính giá Studio
    v_duration_hours := EXTRACT(EPOCH FROM (p_end_time - p_start_time)) / 3600.0;
    v_studio_price := v_duration_hours * v_studio.price_per_hour;

    -- Tổng giá
    v_total_price := v_studio_price + v_equipment_price;
    v_deposit_amount := ROUND(v_total_price * 0.5);

    -- Sinh mã booking: BK + YYYYMMDDHH24MISS + Random 4 ký tự
    v_booking_code := 'BK' || TO_CHAR(now(), 'YYYYMMDDHH24MISS') || UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 4));

    -- 6. Insert Booking
    INSERT INTO bookings (
        booking_code, user_id, studio_id, start_time, end_time,
        studio_price, equipment_price, total_price, deposit_amount, remaining_amount,
        deposit_deadline, status, payment_status
    ) VALUES (
        v_booking_code, p_user_id, p_studio_id, p_start_time, p_end_time,
        v_studio_price, v_equipment_price, v_total_price, v_deposit_amount, (v_total_price - v_deposit_amount),
        now() + INTERVAL '1 hour', 'pending_payment', 'unpaid'
    ) RETURNING id INTO v_booking_id;

    -- 7. Insert Booking Equipments
    IF p_equipments IS NOT NULL AND jsonb_array_length(p_equipments) > 0 THEN
        FOR v_eq_json IN SELECT * FROM jsonb_array_elements(p_equipments)
        LOOP
            SELECT price INTO v_eq_db FROM equipments WHERE id = (v_eq_json->>'equipment_id')::UUID;
            
            INSERT INTO booking_equipments (booking_id, equipment_id, quantity, unit_price)
            VALUES (v_booking_id, (v_eq_json->>'equipment_id')::UUID, (v_eq_json->>'quantity')::INT, v_eq_db.price);
        END LOOP;
    END IF;

    -- 8. Ghi log payment
    INSERT INTO payment_logs (booking_id, from_status, to_status, amount, changed_by, note)
    VALUES (v_booking_id, NULL, 'unpaid', 0, p_user_id::text, 'System auto log on creation');

    RETURN jsonb_build_object(
        'success', true,
        'booking_id', v_booking_id,
        'booking_code', v_booking_code
    );
END;
$$ LANGUAGE plpgsql;
