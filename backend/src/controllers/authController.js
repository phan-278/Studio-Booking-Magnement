const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const createToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d"
    }
  );
};

const registerUser = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !email || !password) {
      return res.status(400).json({
        message: "Please provide name, phone, email, and password"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      phone,
      email,
      password: hashedPassword
    });

    const token = createToken(newUser);

    return res.status(201).json({
      message: "Register successful",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password"
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const token = createToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

module.exports = {
  registerUser,
  loginUser
};