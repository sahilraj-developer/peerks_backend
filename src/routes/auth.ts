import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { authenticate, createToken } from "../middleware/auth";
import { OAuth2Client } from "google-auth-library";

const GOOGLE_CLIENT_ID = "fd9f29df-309b-4418-8144-f99422d4b10c";
const client = new OAuth2Client(GOOGLE_CLIENT_ID);


const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = createToken({ id: user._id.toString(), role: user.role, email: user.email });

    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        pointBalance: user.pointBalance,
        college: user.college,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error });
  }
});

const EARLY_BIRD_COINS = 1000;

router.post("/guest", async (req, res) => {
  try {
    const { firstName, lastName, college, username } = req.body;
    if (!username) return res.status(400).json({ message: "Username required" });

    const normalizedUsername = String(username).trim().toLowerCase();
    const email = `${normalizedUsername}@peerks.local`;
    const displayName = [firstName, lastName].filter(Boolean).join(" ").trim() || normalizedUsername;
    const collegeTrim = college != null ? String(college).trim() : "";

    let user = await User.findOne({ email });
    if (!user) {
      const randomPassword = `peerks_${Math.random().toString(36).slice(2, 10)}`;
      const hashed = await bcrypt.hash(randomPassword, 10);
      user = await User.create({
        name: displayName,
        email,
        password: hashed,
        college: collegeTrim || undefined,
        pointBalance: EARLY_BIRD_COINS,
      });
    } else {
      if (collegeTrim) user.college = collegeTrim;
      if (displayName) user.name = displayName;
      await user.save();
    }

    const token = createToken({ id: user._id.toString(), role: user.role, email: user.email });
    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        pointBalance: user.pointBalance,
        college: user.college,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Guest sign-in failed", error });
  }
});

router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: "idToken required" });

    // Verify the Google ID Token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ message: "Invalid Google token payload" });
    }

    const email = payload.email;
    const name = payload.name || "Google User";

    let user = await User.findOne({ email });
    if (!user) {
      const randomPassword = `peerks_${Math.random().toString(36).slice(2, 10)}`;
      const hashed = await bcrypt.hash(randomPassword, 10);
      user = await User.create({
        name,
        email,
        password: hashed,
        pointBalance: EARLY_BIRD_COINS,
      });
    }

    // Sometimes a user might login with Google but already have a guest acc with the same email if it matched somehow (rare but possible).
    const token = createToken({ id: user._id.toString(), role: user.role, email: user.email });
    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        pointBalance: user.pointBalance,
        college: user.college,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Google sign-in failed", error });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const token = createToken({ id: user._id.toString(), role: user.role, email: user.email });
    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        pointBalance: user.pointBalance,
        college: user.college,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
});

router.get("/me", authenticate, async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  const user = await User.findById(userId).select("name email role pointBalance college");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      pointBalance: user.pointBalance,
      college: user.college,
    },
  });
});

export default router;
