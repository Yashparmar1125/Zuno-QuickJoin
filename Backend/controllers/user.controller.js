import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../Models/user.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../middleware/auth.middleware.js";

// Provide a predictable avatar when photoURL is missing
const withAvatarFallback = (user) => {
  if (!user) return user;
  const base = user.photoURL;
  if (base && base.length) return user;
  const label = encodeURIComponent(user.name || user.email || "User");
  const fallback = `https://ui-avatars.com/api/?name=${label}&background=0D8ABC&color=fff`;
  return { ...user, photoURL: fallback };
};

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const user = await User.create({ name, email, password });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:
        parseInt(process.env.REFRESH_COOKIE_DAYS || "7", 10) *
        24 *
        60 *
        60 *
        1000,
    });
    return res.status(201).json({
      message: "User created successfully",
      user: withAvatarFallback({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photoURL: user.photoURL,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }),
      token: accessToken,
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// Login existing user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:
        parseInt(process.env.REFRESH_COOKIE_DAYS || "7", 10) *
        24 *
        60 *
        60 *
        1000,
    });
    return res.status(200).json({
      message: "Login successful",
      user: withAvatarFallback({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photoURL: user.photoURL,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }),
      token: accessToken,
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// Get current authenticated user
export const getCurrentUser = async (req, res) => {
  return res.status(200).json({ user: withAvatarFallback(req.user) });
};

// Refresh access token using refresh token cookie
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies && req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const accessToken = generateAccessToken(user._id);
    return res.status(200).json({ token: accessToken });
  } catch (err) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};

// Logout by clearing refresh token cookie
export const logoutUser = async (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return res.status(200).json({ message: "Logged out" });
};

// Change password for authenticated user
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new password required" });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// Initiate password reset flow
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(200)
        .json({ message: "If account exists, email sent" });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // TODO: Integrate email service. For now, return token for development.
    return res.status(200).json({
      message: "Reset token generated",
      resetToken,
    });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// Reset password with provided token
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "New password is required" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

export default {
  registerUser,
  loginUser,
  getCurrentUser,
  refreshAccessToken,
  logoutUser,
  changePassword,
  forgotPassword,
  resetPassword,
};

