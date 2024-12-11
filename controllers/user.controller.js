import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import data, { findUserByEmail } from '../data/data.js';

const register = async (req, res) => {
    try {
        const { first_name, last_name, email, password, telephone_number, location } = req.body;

        if (!first_name || !last_name || !email || !password || !telephone_number || !location) {
            return res.status(400).json({ ok: false, msg: "Missing required fields" });
        }

        const emailExist = findUserByEmail(email);
        if (emailExist) {
            return res.status(409).json({ ok: false, msg: "Email already exists" });
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const newUser = {
            id: uuidv4(),
            first_name,
            last_name,
            email,
            password: hashedPassword,
            telephone_number,
            location,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        data.user.push(newUser);

        const token = jwt.sign(
            { id: newUser.id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(201).json({ ok: true, token, user: { id: newUser.id, email: newUser.email } });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
            ok: false,
            message: "Error in user registration",
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

        const user = findUserByEmail(email);
        if (!user) {
            return res.status(404).json({ ok: false, msg: "User not found" });
        }

        let validPassword;
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
            validPassword = await bcryptjs.compare(password, user.password);
        } else {
            validPassword = password === user.password;
        }

        if (!validPassword) {
            return res.status(400).json({ ok: false, msg: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        return res.status(200).json({ 
            ok: true, 
            token, 
            user: { 
                id: user.id, 
                email: user.email, 
                first_name: user.first_name, 
                last_name: user.last_name 
            } 
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            ok: false,
            message: "Error in user login",
            error: error.message
        });
    }
};

const profile = async (req, res) => {
    try {
        const user = findUserByEmail(req.user.email);

        if (!user) {
            return res.status(404).json({ ok: false, message: "User not found" });
        }

        const { password, ...userWithoutPassword } = user;

        return res.json({
            ok: true,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error("Profile error:", error);
        return res.status(500).json({
            ok: false,
            message: "Error retrieving user profile",
            error: error.message
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = data.user.map(({ password, ...user }) => user);
        return res.json({ ok: true, users });
    } catch (error) {
        console.error("Get all users error:", error);
        return res.status(500).json({
            ok: false,
            message: "Error retrieving all users",
            error: error.message
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = data.user.find(user => user.id === id);

        if (!user) {
            return res.status(404).json({ ok: false, message: "User not found" });
        }

        const { password, ...userWithoutPassword } = user;
        return res.json({ ok: true, user: userWithoutPassword });
    } catch (error) {
        console.error("Get user by ID error:", error);
        return res.status(500).json({
            ok: false,
            message: "Error retrieving user by ID",
            error: error.message
        });
    }
};

export const UserController = {
    register,
    login,
    profile,
    getAllUsers,
    getUserById
};