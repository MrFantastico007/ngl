import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { UAParser } from "ua-parser-js";
import geoip from "geoip-lite";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import dns from "node:dns";
import jwt from "jsonwebtoken";
import Message from "./models/Message.js";
import Admin from "./models/Admin.js";

dns.setServers(['8.8.8.8', '1.1.1.1']);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: `${__dirname}/.env` });

const app = express();
const PORT = process.env.PORT || 1234;
const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : '*',
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  credentials: true,
}));
app.use(express.json());

// ─── MongoDB Connection ────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅  MongoDB connected"))
  .catch((err) => {
    console.error("❌  MongoDB error:", err.message);
    process.exit(1);
  });

// ─── Auth Middleware ──────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const auth = req.headers["authorization"];
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(auth.slice(7), JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, error: "Invalid or expired token" });
  }
}

// ─── Helper: Get Real IP ──────────────────────────────────────────────────────
function getRealIP(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  const ip = req.socket.remoteAddress || "Unknown";
  // Normalize IPv6 loopback to readable form
  if (ip === "::1" || ip === "::ffff:127.0.0.1") return "localhost";
  return ip;
}

// ═══════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ═══════════════════════════════════════════════════════════════════════

// ─── POST /api/messages — Save anonymous message ──────────────────────────────
app.post("/api/messages", async (req, res) => {
  try {
    const { username, text, deviceModel: clientModel, devicePlatform: clientPlatform } = req.body;
    if (!username || !text) {
      return res.status(400).json({ success: false, error: "username and text are required" });
    }

    // Timezone is sent as a header from the frontend
    const timezone = req.headers["timezone"] || req.body.timezone || "Unknown";

    const ip = getRealIP(req);
    const isLocalhost = ip === "localhost";
    const geo = isLocalhost ? {} : (geoip.lookup(ip) || {});
    const parser = new UAParser(req.headers["user-agent"] || "");
    const deviceInfo = parser.getDevice();
    const browserInfo = parser.getBrowser();
    const osInfo = parser.getOS();

    const deviceType = deviceInfo.type || "desktop";
    const deviceVendor = deviceInfo.vendor || "";
    const uaModel = deviceInfo.model || "";
    const osName = osInfo.name || "";
    const osVersion = osInfo.version || "";

    // Prefer Client Hints model (real device name like "moto g73 5G")
    // over UA parser model (often just "K" due to Chrome's UA reduction)
    const bestModel = clientModel || uaModel;
    const isGoodModel = bestModel.length > 2 || /^\d/.test(bestModel);

    let deviceDisplay;
    if (clientModel) {
      // Client Hints gave us the real model, e.g. "moto g73 5G"
      deviceDisplay = `${clientModel} (${deviceType})`;
    } else if (isGoodModel && deviceVendor) {
      // e.g. "Samsung SM-G991B (mobile)"
      deviceDisplay = `${deviceVendor} ${bestModel} (${deviceType})`;
    } else if (isGoodModel) {
      // e.g. "SM-G991B (mobile)"
      deviceDisplay = `${bestModel} (${deviceType})`;
    } else if (deviceVendor) {
      // e.g. "Apple iPhone (mobile)"
      deviceDisplay = `${deviceVendor} ${osName} ${deviceType}`;
    } else if (osName) {
      // Fallback: "Android 13 mobile"
      deviceDisplay = `${osName} ${osVersion} ${deviceType}`.trim();
    } else {
      deviceDisplay = deviceType;
    }

    const message = new Message({
      username: username.toLowerCase(),
      text,
      createdAt: new Date(),
      sender: {
        ip: isLocalhost ? "localhost (testing)" : ip,
        country: geo.country || (isLocalhost ? "Local" : "Unknown"),
        region: geo.region || (isLocalhost ? "Local" : "Unknown"),
        city: geo.city || (isLocalhost ? "Local" : "Unknown"),
        device: deviceDisplay,
        browser: `${browserInfo.name || "Unknown"} ${browserInfo.version || ""}`.trim(),
        os: `${osInfo.name || "Unknown"} ${osInfo.version || ""}`.trim(),
        userAgent: req.headers["user-agent"] || "Unknown",
        language: req.headers["accept-language"] || "Unknown",
        timezone,
      },
    });

    await message.save();
    console.log(`📩  @${username} ← ${ip} | Device: ${deviceDisplay}`);
    res.json({ success: true, id: message._id });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════
// ADMIN AUTH ROUTES
// ═══════════════════════════════════════════════════════════════════════

// ─── POST /api/admin/register ─────────────────────────────────────────────────
app.post("/api/admin/register", async (req, res) => {
  try {
    const { username, displayName, password } = req.body;
    if (!username || !password || !displayName) {
      return res.status(400).json({ success: false, error: "All fields required" });
    }
    const exists = await Admin.findOne({ username: username.toLowerCase() });
    if (exists) {
      return res.status(409).json({ success: false, error: "Username already taken" });
    }
    const admin = new Admin({
      username: username.toLowerCase(),
      displayName,
      passwordHash: password, // hashed by pre-save hook
    });
    await admin.save();
    console.log(`👤  New admin registered: @${username}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/admin/login ────────────────────────────────────────────────────
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: "Username and password required" });
    }
    const admin = await Admin.findOne({ username: username.toLowerCase() });
    if (!admin) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }
    const valid = await admin.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }
    const token = jwt.sign(
      { id: admin._id, username: admin.username, displayName: admin.displayName },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
    console.log(`🔑  Admin login: @${username}`);
    res.json({ success: true, token, username: admin.username, displayName: admin.displayName });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── GET /api/admin/me — Validate token ──────────────────────────────────────
app.get("/api/admin/me", requireAuth, (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// ═══════════════════════════════════════════════════════════════════════
// PROTECTED ADMIN MESSAGE ROUTES
// ═══════════════════════════════════════════════════════════════════════

// ─── GET /api/admin/messages/:username ───────────────────────────────────────
app.get("/api/admin/messages/:username", requireAuth, async (req, res) => {
  try {
    // Admin can only view their own messages
    if (req.params.username !== req.admin.username) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }
    const messages = await Message.find({
      username: req.params.username,
    }).sort({ createdAt: -1 });
    res.json({ success: true, count: messages.length, messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── DELETE /api/admin/messages/:id ──────────────────────────────────────────
app.delete("/api/admin/messages/:id", requireAuth, async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, error: "Not found" });
    // Ensure the admin owns this message
    if (msg.username !== req.admin.username) {
      return res.status(403).json({ success: false, error: "Access denied" });
    }
    await msg.deleteOne();
    console.log(`🗑️  Deleted msg ${req.params.id}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  NGL Backend → http://localhost:${PORT}`);
});
