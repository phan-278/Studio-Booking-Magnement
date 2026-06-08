const studioService = require('../services/studio.service');

class StudioController {
  async getStudios(req, res) {
    try {
      const studios = await studioService.getStudios();
      res.json(studios);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch studios' });
    }
  }

  async getStudioById(req, res) {
    try {
      const { id } = req.params;
      const studio = await studioService.getStudioById(id);
      if (!studio) return res.status(404).json({ error: 'Studio not found' });
      res.json(studio);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch studio' });
    }
  }

  async createStudio(req, res) {
    try {
      const studio = await studioService.createStudio(req.body);
      res.status(201).json(studio);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create studio' });
    }
  }

  async updateStudio(req, res) {
    try {
      const { id } = req.params;
      const studio = await studioService.updateStudio(id, req.body);
      res.json(studio);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update studio' });
    }
  }

  async deleteStudio(req, res) {
    try {
      const { id } = req.params;
      const studio = await studioService.deleteStudio(id);
      res.json({ message: 'Studio deactivated successfully', studio });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete studio' });
    }
  }
}

module.exports = new StudioController();
