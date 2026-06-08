const equipmentService = require('../services/equipment.service');

class EquipmentController {
  async getEquipments(req, res) {
    try {
      const { start_time, end_time } = req.query;
      const equipments = await equipmentService.getEquipments(start_time, end_time);
      res.json(equipments);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch equipments' });
    }
  }

  async createEquipment(req, res) {
    try {
      const equipment = await equipmentService.createEquipment(req.body);
      res.status(201).json(equipment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create equipment' });
    }
  }

  async updateEquipment(req, res) {
    try {
      const { id } = req.params;
      const equipment = await equipmentService.updateEquipment(id, req.body);
      res.json(equipment);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update equipment' });
    }
  }

  async deleteEquipment(req, res) {
    try {
      const { id } = req.params;
      const equipment = await equipmentService.deleteEquipment(id);
      res.json({ message: 'Equipment deactivated successfully', equipment });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete equipment' });
    }
  }
}

module.exports = new EquipmentController();
