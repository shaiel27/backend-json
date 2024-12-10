import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
const { JWT_SECRET } = process.env;

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ ok: false, message: 'Authentication required' });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if the token is for a worker or a user
    if (decoded.role) {
      // It's a worker
      req.worker = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };
    } else {
      // It's a user
      req.user = {
        id: decoded.id,
        email: decoded.email
      };
    }
    
    next();
  } catch (error) {
    res.status(401).json({ ok: false, message: 'Invalid or expired token' });
  }
};

