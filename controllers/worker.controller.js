import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import data, { findWorkerByEmail } from '../data/data.js';

const register = async (req, res) => {
    try {
        const { first_name, last_name, email, password, telephone_number, location, role_id, admin_id, status, date_birth, gender, emergency_contact_name, emergency_contact_relationship, emergency_contact_number, License_number, Years_experience, education, Certifications } = req.body;

        if (!first_name || !last_name || !email || !password || !telephone_number || !location || !role_id || !admin_id || !status || !date_birth || !gender || !emergency_contact_name || !emergency_contact_relationship || !emergency_contact_number || !License_number || !Years_experience || !education || !Certifications) {
            return res.status(400).json({ ok: false, msg: "Missing required fields" });
        }

        const emailExist = findWorkerByEmail(email);
        if (emailExist) {
            return res.status(409).json({ ok: false, msg: "Email already exists" });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const newWorker = {
            id: (data.workers.length + 1).toString(),
            first_name,
            last_name,
            email,
            password: hashedPassword,
            telephone_number,
            location,
            role_id,
            admin_id,
            status,
            date_birth,
            gender,
            emergency_contact_name,
            emergency_contact_relationship,
            emergency_contact_number,
            License_number,
            Years_experience,
            education,
            Certifications,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        data.workers.push(newWorker);

        const token = jwt.sign(
            { email: newWorker.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(201).json({ ok: true, token });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
            ok: false,
            message: "Error in worker registration",
            error: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ ok: false, msg: "Missing required fields: email, password" });
        }

        const worker = findWorkerByEmail(email);
        if (!worker) {
            return res.status(404).json({ ok: false, msg: "Worker not found" });
        }

        // IMPORTANT: This is for demonstration purposes only.
        // In a real application, you should NEVER store or compare passwords in plain text.
        // Always use a secure hashing algorithm like bcrypt.
        const validPassword = (password === worker.password);

        if (!validPassword) {
            return res.status(400).json({ ok: false, msg: "Password incorrect" });
        }

        const token = jwt.sign(
            { email: worker.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({ ok: true, token });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            ok: false,
            message: "Error in worker login",
            error: error.message
        });
    }
};

const profile = async (req, res) => {
    try {
        const worker = findWorkerByEmail(req.email);

        if (!worker) {
            return res.status(404).json({ ok: false, message: "Worker not found" });
        }

        const { password, ...workerWithoutPassword } = worker;

        return res.json({
            ok: true,
            worker: workerWithoutPassword
        });
    } catch (error) {
        console.error("Profile error:", error);
        return res.status(500).json({
            ok: false,
            message: "Error retrieving worker profile",
            error: error.message
        });
    }
};

const getAllWorkers = async (req, res) => {
    try {
        const workers = data.workers.map(({ password, ...worker }) => worker);
        return res.json({ ok: true, workers });
    } catch (error) {
        console.error("Get all workers error:", error);
        return res.status(500).json({
            ok: false,
            message: "Error retrieving all workers",
            error: error.message
        });
    }
};

const getWorkerById = async (req, res) => {
    try {
        const { id } = req.params;
        const worker = data.workers.find(worker => worker.id === id);

        if (!worker) {
            return res.status(404).json({ ok: false, message: "Worker not found" });
        }

        const { password, ...workerWithoutPassword } = worker;
        return res.json({ ok: true, worker: workerWithoutPassword });
    } catch (error) {
        console.error("Get worker by ID error:", error);
        return res.status(500).json({
            ok: false,
            message: "Error retrieving worker by ID",
            error: error.message
        });
    }
};

const getWorkerSchedule = async (req, res) => {
    try {
        const worker = findWorkerByEmail(req.email);

        if (!worker) {
            return res.status(404).json({ ok: false, message: "Worker not found" });
        }

        const workerSchedule = data.schedule.find(schedule => schedule.worker_id === worker.id);

        if (!workerSchedule) {
            return res.status(404).json({ ok: false, message: "Schedule not found for this worker" });
        }

        return res.json({
            ok: true,
            schedule: workerSchedule
        });
    } catch (error) {
        console.error("Get worker schedule error:", error);
        return res.status(500).json({
            ok: false,
            message: "Error retrieving worker schedule",
            error: error.message
        });
    }
};

const getWorkerAppointments = async (req, res) => {
    try {
        const worker = findWorkerByEmail(req.email);

        if (!worker) {
            return res.status(404).json({ ok: false, message: "Worker not found" });
        }

        const workerSchedule = data.schedule.find(schedule => schedule.worker_id === worker.id);

        if (!workerSchedule) {
            return res.status(404).json({ ok: false, message: "Schedule not found for this worker" });
        }

        const workerAppointments = data.appointment.filter(appointment => appointment.schedule_id === workerSchedule.id);

        if (workerAppointments.length === 0) {
            return res.json({ ok: true, message: "No appointments found for this worker", appointments: [] });
        }

        const appointmentsWithDetails = workerAppointments.map(appointment => {
            const service = data.service.find(service => service.id === appointment.service_id);
            const petOwner = data.pet_owners.find(owner => owner.id === appointment.pet_owner_id);
            const user = data.user.find(user => user.id === petOwner.user_id);
            const pet = data.pet.find(pet => pet.id === petOwner.pet_id);

            return {
                ...appointment,
                service: service ? { name: service.name, description: service.description } : null,
                petOwner: user ? { name: `${user.first_name} ${user.last_name}`, email: user.email } : null,
                pet: pet ? { name: pet.name, breed: data.breed.find(breed => breed.id === pet.fk_breed)?.name } : null
            };
        });

        return res.json({
            ok: true,
            appointments: appointmentsWithDetails
        });
    } catch (error) {
        console.error("Get worker appointments error:", error);
        return res.status(500).json({
            ok: false,
            message: "Error retrieving worker appointments",
            error: error.message
        });
    }
};

export const WorkerController = {
    register,
    login,
    profile,
    getAllWorkers,
    getWorkerById,
    getWorkerSchedule,
    getWorkerAppointments
};

