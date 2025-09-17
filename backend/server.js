// backend/server.js (ES module)
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5500;

// Simple in-memory user store (for dev only)
const users = new Map(); // key: username, value: { id, username, passwordHash }

// --- Middlewares ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware (in-memory store) - dev only
app.use(
  session({
    secret: "replace_this_with_a_real_secret_in_prod",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// Serve static assets (css, js, images, pages if public has them)
app.use(express.static(path.join(__dirname, "../public")));

// --- Auth helper middleware ---
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    // optionally refresh session timestamp or reattach user
    return next();
  }
  // if request expects HTML page, redirect to login page
  if (req.accepts("html")) return res.redirect("/login.html"); // adjust file path if you have /public/login.html
  // else respond with JSON
  return res.status(401).json({ error: "Unauthorized" });
}

// --- Example routes serving HTML pages ---
// Serve homepage (public)
app.get("/homepage", (req, res) => {
  return res.sendFile(path.join(__dirname, "../public/index.html")); // or pages/homepage.html
});

// Protected dashboard (only logged in users)
app.get("/dashboard", requireAuth, (req, res) => {
  // send a protected HTML page
  return res.sendFile(path.join(__dirname, "../public/pages/dashboard.html"));
});

// --- Authentication API ---
// POST /signup  { username, password }
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "username and password required" });

  if (users.has(username))
    return res.status(409).json({ error: "username already exists" });

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  const id = Date.now().toString();
  users.set(username, { id, username, passwordHash });

  // auto-login after signup
  req.session.user = { id, username };
  return res.json({ ok: true, user: { id, username } });
});

// POST /login { username, password }
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "username and password required" });

  const user = users.get(username);
  if (!user) return res.status(401).json({ error: "invalid credentials" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: "invalid credentials" });

  // successful login: store minimal info in session
  req.session.user = { id: user.id, username: user.username };
  return res.json({ ok: true, user: { id: user.id, username: user.username } });
});

// POST /logout
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: "failed to logout" });
    res.clearCookie("connect.sid");
    return res.json({ ok: true });
  });
});

// GET /me - get current user (useful for frontend to check login state)
app.get("/me", (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ user: req.session.user });
  }
  return res.status(401).json({ error: "unauthenticated" });
});

// --- Optional: any other API route protected by requireAuth ---
app.get("/api/protected-data", requireAuth, (req, res) => {
  return res.json({ secret: `Hello ${req.session.user.username}!` });
});

// --- Catch-all middleware for SPA (put this LAST) ---
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
