import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.some(role => req.user.roles.includes(role))) {
      return res.status(403).json({
        message: 'You do not have permission for this action.'
      });
    }
    next();
  };
}

export function requireActiveRole(role) {
  return (req, res, next) => {
    if (
      !req.user ||
      req.user.activeRole !== role ||
      !req.user.roles.includes(role)
    ) {
      return res.status(403).json({
        message: `Switch to ${role} mode to use this area.`
      });
    }
    next();
  };
}

export function requireInstructorAccess(req, res, next) {
  if (!req.user?.hasInstructorAccess()) {
    return res.status(402).json({
      message: 'Instructor publishing access requires an active instructor plan.'
    });
  }
  next();
}
