import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { generateAccessTokens, generateRefreshTokens } from '../utils/generateTokens.js';
import { sendEmail } from '../utils/sendEmail.js';
import { getEmailTemplate } from '../utils/emailTemplates.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

let refreshTokens = [];

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const sendTokenResponse = (user, accessToken, refreshToken, res) => {
  const isProduction = process.env.NODE_ENV === 'production';

  const options = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'None' : 'Lax',
    maxAge: 15 * 60 * 1000
  };

  const refreshOptions = {
    ...options,
    maxAge: 30 * 24 * 60 * 60 * 1000
  };

  res.cookie('accessToken', accessToken, options);
  res.cookie('refreshToken', refreshToken, refreshOptions);

  return res.status(200).json({
    success: true,
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      restaurantDetails: user.restaurantDetails
    }
  });
};

const generateAndSendOTP = async (email, subject) => {
  const otp = crypto.randomInt(100000, 999999).toString();
  const cleanEmail = email.toLowerCase().trim();

  // FIX: We must update 'createdAt' to reset the 5-minute expiration timer
  await OTP.findOneAndUpdate(
    { email: cleanEmail },
    { otp, email: cleanEmail, createdAt: Date.now() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`📧 OTP Sent to ${cleanEmail}: ${otp}`); // Debug Log

  const emailHtml = getEmailTemplate(otp, subject);
  await sendEmail(cleanEmail, subject, emailHtml);
};

// ==========================================
// 1. SIGNUP & VERIFICATION
// ==========================================

export const signup = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists please login" });
    }

    const user = await User.create({
      fullName,
      email: cleanEmail,
      password,
      role: role || 'customer',
      isEmailVerified: false
    });

    await generateAndSendOTP(cleanEmail, "Verify your Account");

    return res.status(201).json({
      success: true,
      message: "Account created. OTP sent to email.",
      email: cleanEmail
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const verifySignup = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const validOTP = await OTP.findOne({ email: cleanEmail, otp: cleanOtp });

    if (!validOTP) {
      console.log(`❌ Invalid OTP Signup. Input: ${cleanOtp} for ${cleanEmail}`);
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isEmailVerified = true;
    await user.save();
    await OTP.deleteOne({ _id: validOTP._id });

    const accessToken = generateAccessTokens(user._id, user.role);
    const refreshToken = generateRefreshTokens(user._id);
    refreshTokens.push(refreshToken);

    return sendTokenResponse(user, accessToken, refreshToken, res);

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// 2. LOGIN & 2FA
// ==========================================

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(401).json({ message: "User does not exist" });

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    await generateAndSendOTP(cleanEmail, "Login Verification Code");

    return res.status(200).json({
      success: true,
      requireOtp: true,
      message: "Credentials valid. OTP sent.",
      email: cleanEmail
    });

  } catch (error) {
    console.error("Login Controller Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const verifyLogin = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    console.log(`🔍 Verifying Login: Email=${cleanEmail}, OTP=${cleanOtp}`);

    // Check if any OTP exists for this email (to debug expiration)
    const existingRecord = await OTP.findOne({ email: cleanEmail });
    if (!existingRecord) {
      console.log(`❌ No OTP record found for ${cleanEmail}. It might have expired.`);
    } else {
      console.log(`ℹ️ OTP in DB is: ${existingRecord.otp}`);
    }

    const validOTP = await OTP.findOne({ email: cleanEmail, otp: cleanOtp });

    if (!validOTP) {
      return res.status(400).json({ message: "Invalid or Expired OTP" });
    }

    const user = await User.findOne({ email: cleanEmail });

    const accessToken = generateAccessTokens(user._id, user.role);
    const refreshToken = generateRefreshTokens(user._id);
    refreshTokens.push(refreshToken);

    await OTP.deleteOne({ _id: validOTP._id });

    console.log("✅ Login Verified Successfully");
    return sendTokenResponse(user, accessToken, refreshToken, res);

  } catch (error) {
    console.error("Login Verification Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// ==========================================
// 3. PASSWORD RESET FLOW
// ==========================================

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    await generateAndSendOTP(cleanEmail, "Password Reset OTP");

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const validOTP = await OTP.findOne({ email: cleanEmail, otp: cleanOtp });
    if (!validOTP) return res.status(400).json({ message: "Invalid OTP" });

    res.status(200).json({ message: "OTP Verified" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.password = newPassword;
    await user.save();
    await OTP.findOneAndDelete({ email: cleanEmail });

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ==========================================
// 4. TOKEN MANAGEMENT
// ==========================================

export const refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;

  if (!token) return res.status(401).json({ message: "Refresh Token is required" });
  if (!refreshTokens.includes(token)) return res.status(401).json({ message: "Invalid Refresh Token" });

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.userId);
    const accessToken = generateAccessTokens(user._id, user.role);

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'None' : 'Lax',
      maxAge: 15 * 60 * 1000
    });

    return res.status(200).json({ accessToken });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message })
  }
}

export const logout = (req, res) => {
  const token = req.cookies?.refreshToken || req.body.refreshToken;
  try {
    refreshTokens = refreshTokens.filter(t => t !== token);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message })
  }
}

// ==========================================
// 5. USER PROFILE & FAVORITES
// ==========================================

export const toggleFavorite = async (req, res) => {
  try {
    // req.user is already popualted by authMiddleware
    // But let's fetch fresh to ensure we save correctly
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user._id;
    const { item } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if exists
    const existingIndex = user.favorites.findIndex(f => f.title === item.title && f.restaurant === item.restaurant);

    if (existingIndex > -1) {
      // Remove
      user.favorites.splice(existingIndex, 1);
      await user.save();
      return res.status(200).json({ success: true, message: "Removed from favorites", favorites: user.favorites });
    } else {
      // Add
      user.favorites.push(item);
      await user.save();
      return res.status(200).json({ success: true, message: "Added to favorites", favorites: user.favorites });
    }

  } catch (error) {
    console.error("Favorite Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFavorites = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // req.user is already the user document from middleware, but let's be safe and just return it
    // Or fetch fresh if we want to be sure of latest data
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ success: true, favorites: user.favorites });
  } catch (error) {
    console.error("Get Favorites Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};