import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../Models/user.model.js";
import initFirebaseAdmin from "../config/firebaseAdmin.js";

// Ensure a local user document exists for a Firebase user to preserve existing DB relations
export const ensureUserForFirebase = async (decoded) => {
  const firebaseUid = decoded.uid;
  if (!firebaseUid) return null;

  let user = await User.findOne({ firebaseUid });
  if (!user) {
    user = await User.create({
      firebaseUid,
      email: decoded.email,
      name: decoded.name || decoded.email || "Firebase User",
      photoURL: decoded.picture || "",
      password: undefined,
    });
  } else {
    // Update basic profile fields if they changed
    const updates = {};
    if (decoded.email && decoded.email !== user.email) updates.email = decoded.email;
    if (decoded.name && decoded.name !== user.name) updates.name = decoded.name;
    if (decoded.picture && decoded.picture !== user.photoURL)
      updates.photoURL = decoded.picture;
    if (Object.keys(updates).length) {
      Object.assign(user, updates);
      await user.save({ validateBeforeSave: false });
    }
  }

  return user;
};

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized – No token");
  }

  // 1) Try legacy JWT path (backward compatible)
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      res.status(401);
      throw new Error("User not found");
    }
    req.user = user;
    return next();
  } catch (err) {
    // fall through to Firebase verification
  }

  // 2) Try Firebase ID token verification
  const admin = initFirebaseAdmin();
  if (!admin) {
    res.status(401);
    throw new Error("Not authorized – Auth service unavailable");
  }

  try {
    const decodedFirebase = await admin.auth().verifyIdToken(token);
    const user = await ensureUserForFirebase(decodedFirebase);
    if (!user) {
      res.status(401);
      throw new Error("Not authorized – User mapping failed");
    }
    req.user = user;
    return next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    res.status(401);
    throw new Error("Not authorized – Invalid Token");
  }
});

export const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "15m",
  });
};

export const generateRefreshToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
    }
  );
};
