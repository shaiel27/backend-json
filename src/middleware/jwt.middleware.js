import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ ok: false, message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.email = decoded.email;
    next();
  } catch (error) {
    res.status(401).json({ ok: false, message: 'Token is not valid' });
  }
};

export default authMiddleware;

