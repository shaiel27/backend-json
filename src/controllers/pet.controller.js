import data from "../data/data.js";

export const PetController = {
  getAllPets: (req, res) => {
    try {
      const pets = data.pet;
      res.status(200).json({ ok: true, pets });
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  },

  getPetById: (req, res) => {
    try {
      const { id } = req.params;
      const pet = data.pet.find(p => p.id === id);
      if (!pet) {
        return res.status(404).json({ ok: false, message: 'Pet not found' });
      }
      res.status(200).json({ ok: true, pet });
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  },

  getPetsByBreed: (req, res) => {
    try {
      const { breedId } = req.params;
      const pets = data.pet.filter(p => p.fk_breed === breedId);
      res.status(200).json({ ok: true, pets });
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  }
};

