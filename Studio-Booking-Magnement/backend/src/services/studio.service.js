const supabase = require('../config/supabase');

class StudioService {
  async getStudios() {
    const { data, error } = await supabase
      .from('studios')
      .select('*')
      .eq('is_available', true);
    
    if (error) throw error;
    return data;
  }

  async getStudioById(id) {
    const { data, error } = await supabase
      .from('studios')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  }

  async createStudio(studioData) {
    const { data, error } = await supabase
      .from('studios')
      .insert([studioData])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  async updateStudio(id, updateData) {
    const { data, error } = await supabase
      .from('studios')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }

  async deleteStudio(id) {
    // Soft delete
    const { data, error } = await supabase
      .from('studios')
      .update({ is_available: false })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
}

module.exports = new StudioService();
