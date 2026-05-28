import { Router } from "express";
import Joi from "joi";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();
router.use(requireAuth);

const teamSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  description: Joi.string().max(300).allow(""),
});

router.post("/", async (req, res, next) => {
  const { error, value } = teamSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      "INSERT INTO teams (name, description, created_by) VALUES ($1, $2, $3) RETURNING id, name, description, created_by AS \"createdBy\"",
      [value.name, value.description || "", req.user.id]
    );
    const team = rows[0];
    await client.query(
      "INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)",
      [team.id, req.user.id]
    );
    await client.query("COMMIT");
    res.json(team);
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
});

router.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT t.id, t.name, t.description, t.created_by AS "createdBy",
        COALESCE(
          (SELECT json_agg(json_build_object('id', u.id, 'email', u.email, 'displayName', u.display_name))
            FROM team_members tm JOIN users u ON u.id = tm.user_id WHERE tm.team_id = t.id),
          '[]'::json
        ) AS members
       FROM teams t
       JOIN team_members tm ON tm.team_id = t.id
       WHERE tm.user_id = $1
       ORDER BY t.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/members", async (req, res, next) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });
  try {
    const { rows } = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (!rows.length) return res.status(404).json({ error: "User not found" });

    await pool.query(
      "INSERT INTO team_members (team_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      [req.params.id, rows[0].id]
    );
    console.log(`[STUB EMAIL] Invited ${email} to team ${req.params.id}`);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT created_by FROM teams WHERE id = $1", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    if (rows[0].created_by !== req.user.id) {
      return res.status(403).json({ error: "Only creator can delete" });
    }
    await pool.query("DELETE FROM teams WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;