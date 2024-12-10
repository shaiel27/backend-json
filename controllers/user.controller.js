import data from "../data/data.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const { JWT_SECRET } = process.env;

export const UserController = {
  getAllUsers: (req, res) => {
    try {
      const users = data.user;
      res.status(200).json({ ok: true, users });
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  },

  getUserById: (req, res) => {
    try {
      const { id } = req.params;
      const user = data.user.find(u => u.id === id);
      if (!user) {
        return res.status(404).json({ ok: false, message: 'User not found' });
      }
      res.status(200).json({ ok: true, user });
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  },

  createUser: (req, res) => {
    try {
      const { first_name, last_name, telephone_number, email, location, password } = req.body;
      const newUser = {
        id: (data.user.length + 1).toString(),
        first_name,
        last_name,
        telephone_number,
        email,
        location,
        password: bcrypt.hashSync(password, 10),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      data.user.push(newUser);
      res.status(201).json({ ok: true, user: newUser });
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  },

  updateUser: (req, res) => {
    try {
      const { id } = req.params;
      const { first_name, last_name, telephone_number, email, location } = req.body;
      const userIndex = data.user.findIndex(u => u.id === id);
      if (userIndex === -1) {
        return res.status(404).json({ ok: false, message: 'User not found' });
      }
      data.user[userIndex] = {
        ...data.user[userIndex],
        first_name: first_name || data.user[userIndex].first_name,
        last_name: last_name || data.user[userIndex].last_name,
        telephone_number: telephone_number || data.user[userIndex].telephone_number,
        email: email || data.user[userIndex].email,
        location: location || data.user[userIndex].location,
        updated_at: new Date().toISOString()
      };
      res.status(200).json({ ok: true, user: data.user[userIndex] });
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  },

  deleteUser: (req, res) => {
    try {
      const { id } = req.params;
      const userIndex = data.user.findIndex(u => u.id === id);
      if (userIndex === -1) {
        return res.status(404).json({ ok: false, message: 'User not found' });
      }
      data.user.splice(userIndex, 1);
      res.status(200).json({ ok: true, message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  },

  login: (req, res) => {
    try {
      const { email, password } = req.body;
      const user = data.user.find(u => u.email === email);
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ ok: false, message: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
      res.status(200).json({ ok: true, token });
    } catch (error) {
      res.status(500).json({ ok: false, message: error.message });
    }
  }
};