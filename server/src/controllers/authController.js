import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function tokenFor(user) {
  return jwt.sign(
    { id: user._id.toString(), roles: user.roles, activeRole: user.activeRole },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    roles: user.roles,
    activeRole: user.activeRole,
    emailVerified: true,
    instructorAccess: user.instructorAccess || {
      status: 'inactive',
      plan: null,
      expiresAt: null
    }
  };
}

export async function register(req, res) {
  try {
    const { name, email, password, roles = ['student'] } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email and password are required.'
      });
    }

    const normalizedRoles = Array.isArray(roles)
      ? [...new Set(roles)]
      : [roles];

    if (
      !normalizedRoles.length ||
      normalizedRoles.some(
        role => !['student', 'instructor'].includes(role)
      )
    ) {
      return res.status(400).json({
        message: 'Choose Student, Instructor, or Both.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail }).select('+password');

    if (existing) {
      return res.status(409).json({
        message: 'An account with that email already exists. Please log in.'
      });
    }

    const activeRole = normalizedRoles.includes('student')
      ? 'student'
      : 'instructor';

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      roles: normalizedRoles,
      activeRole,
      emailVerified: true
    });

    res.status(201).json({
      token: tokenFor(user),
      user: publicUser(user),
      message: 'Account created successfully.'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: error.message || 'Could not create account.'
    });
  }
}

export async function login(req, res) {
  try {
    const { email, password, activeRole } = req.body;

    const user = await User.findOne({
      email: email?.trim().toLowerCase()
    }).select('+password');

    if (!user || !(await user.comparePassword(password || ''))) {
      return res.status(401).json({
        message: 'Incorrect email or password.'
      });
    }

    if (
      activeRole &&
      !['student', 'instructor', 'admin'].includes(activeRole)
    ) {
      return res.status(400).json({
        message: 'Invalid account mode.'
      });
    }

    if (activeRole && !user.roles.includes(activeRole)) {
      return res.status(403).json({
        message: `This account does not have ${activeRole} access.`
      });
    }

    if (activeRole && user.activeRole !== activeRole) {
      user.activeRole = activeRole;
      await user.save();
    }

    res.json({
      token: tokenFor(user),
      user: publicUser(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: error.message || 'Login failed.'
    });
  }
}

export async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}

export async function switchRole(req, res) {
  try {
    const { role } = req.body;

    if (
      !['student', 'instructor'].includes(role) ||
      !req.user.roles.includes(role)
    ) {
      return res.status(403).json({
        message: 'You do not have this role on your account.'
      });
    }

    req.user.activeRole = role;
    await req.user.save();

    res.json({
      token: tokenFor(req.user),
      user: publicUser(req.user)
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Could not switch role.'
    });
  }
}

export async function becomeInstructor(req, res) {
  try {
    if (!req.user.roles.includes('instructor')) {
      req.user.roles.push('instructor');
    }

    req.user.activeRole = 'instructor';
    await req.user.save();

    res.json({
      message: 'Instructor capability added. Activate an instructor plan to create courses.',
      token: tokenFor(req.user),
      user: publicUser(req.user)
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Could not enable instructor mode.'
    });
  }
}
