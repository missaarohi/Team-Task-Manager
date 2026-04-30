import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const userPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

export const signup = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });

    if (existing) {
      res.status(409);
      throw new Error('Email is already registered');
    }

    const user = await User.create({ name, email, password, role });

    res.status(201).json({
      token: signToken(user._id),
      user: userPayload(user)
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    res.json({
      token: signToken(user._id),
      user: userPayload(user)
    });
  } catch (error) {
    next(error);
  }
};

export const me = (req, res) => {
  res.json({ user: userPayload(req.user) });
};
