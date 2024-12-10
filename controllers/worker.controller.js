import data from "../data/data.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const { JWT_SECRET } = process.env;

export const WorkerController = {
  login: (req, res) => {
    try {
      const { email, password } = req.body;
      const worker = data.worker.find(w => w.email === email);
      if (!worker || password !== worker.password) {
        return res.status(401).json({ ok: false, message: 'Invalid credentials' });
      }
      const token = jwt.sign(
        { id: worker.id, email: worker.email, role: worker.role_id },
        JWT_SECRET,
        { expiresIn: '1h' }
      );
      res.status(200).json({ ok: true, token });
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  },

  getWorkerById: (req, res) => {
    try {
      const { id } = req.params;
      const worker = data.worker.find(w => w.id === id);
      if (!worker) {
        return res.status(404).json({ ok: false, message: 'Worker not found' });
      }
      res.status(200).json({ ok: true, worker });
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  },

  getWorkerByEmail: (req, res) => {
    try {
      const { email } = req.params;
      const worker = data.worker.find(w => w.email === email);
      if (!worker) {
        return res.status(404).json({ ok: false, message: 'Worker not found' });
      }
      res.status(200).json({ ok: true, worker });
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  },

  getWorkerAppointments: (req, res) => {
    try {
      if (!req.worker) {
        return res.status(403).json({ ok: false, message: 'Access denied. Worker authentication required.' });
      }

      const workerId = req.worker.id;
      console.log('All schedules:', data.schedule);
      console.log('Worker ID (from token):', workerId);
      
      const workerSchedule = data.schedule.find(s => s.worker_id === workerId.toString());
      console.log('Worker Schedule:', workerSchedule);
      
      if (!workerSchedule) {
        console.log('No schedule found for worker ID:', workerId);
        return res.status(404).json({ ok: false, message: 'No schedule found for this worker' });
      }

      const workerAppointments = data.appointment.filter(a => a.schedule_id === workerSchedule.id);

      if (workerAppointments.length === 0) {
        return res.status(200).json({ ok: true, message: 'No appointments found for this worker', appointments: [] });
      }

      const enrichedAppointments = workerAppointments.map(appointment => {
        const service = data.service.find(s => s.id === appointment.service_id);
        const petOwner = data.pet_owners.find(po => po.id === appointment.pet_owner_id);
        const user = data.user.find(u => u.id === petOwner.user_id);
        const pet = data.pet.find(p => p.id === petOwner.pet_id);
        const breed = data.breed.find(b => b.id === pet.fk_breed);

        return {
          ...appointment,
          service: service ? service.name : 'Unknown Service',
          clientName: user ? `${user.first_name} ${user.last_name}` : 'Unknown Client',
          petName: pet ? pet.name : 'Unknown Pet',
          petBreed: breed ? breed.name : 'Unknown Breed'
        };
      });

      res.status(200).json({ ok: true, appointments: enrichedAppointments });
    } catch (error) {
      console.error('Error in getWorkerAppointments:', error);
      res.status(500).json({ ok: false, message: error.message });
    }
  },

  getWorkerSchedule: (req, res) => {
    try {
      if (!req.worker) {
        return res.status(403).json({ ok: false, message: 'Access denied. Worker authentication required.' });
      }

      const workerId = req.worker.id;
      console.log('All schedules:', data.schedule);
      console.log('Worker ID (from token):', workerId);
      const workerSchedule = data.schedule.find(s => s.worker_id === workerId.toString());
      console.log('Worker Schedule:', workerSchedule);
    
      if (!workerSchedule) {
        return res.status(404).json({ ok: false, message: 'No schedule found for this worker' });
      }

      res.status(200).json({ ok: true, schedule: workerSchedule });
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  }
};
