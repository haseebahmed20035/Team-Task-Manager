import { Router } from "express";
import bcrypt from "bcrypt";
import Joi from "joi";
import passport from "../passport.js";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  displayName: Joi.string().min(2).max(50).required(),
});

router.post("/register", async (req, res, next) => {
  const { error, value } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [value.email]);
    if (existing.rows.length) return res.status(400).json({ error: "Email already in use" });

    const hash = await bcrypt.hash(value.password, 10);
    const { rows } = await pool.query(
      "INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name",
      [value.email, hash, value.displayName]
    );
    const user = { id: rows[0].id, email: rows[0].email, displayName: rows[0].display_name };

    req.login(user, (err) => {
      if (err) return next(err);
      res.json({ user });
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info?.message || "Invalid credentials" });
    req.login(user, (err) => {
      if (err) return next(err);
      res.json({ user });
    });
  })(req, res, next);
});

router.post("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => res.json({ ok: true }));
  });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;