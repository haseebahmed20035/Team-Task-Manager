import { Router } from "express";
import Joi from "joi";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();
router.use(requireAuth);

const taskSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow(""),
  teamId: Joi.number().integer().required(),
  assigneeId: Joi.number().integer().allow(null),
  dueDate: Joi.date().allow(null),
  status: Joi.string().valid("todo", "in_progress", "done").default("todo"),
});

router.post("/", async (req, res, next) => {
  const { error, value } = taskSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  try {
    const { rows } = await pool.query(
      `INSERT INTO tasks (title, description, team_id, assignee_id, due_date, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, title, description, team_id AS "teamId", assignee_id AS "assigneeId", due_date AS "dueDate", status, created_by AS "createdBy"`,
      [value.title, value.description || "", value.teamId, value.assigneeId || null,
       value.dueDate || null, value.status, req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  const { teamId, assignee } = req.query;
  const conditions = [];
  const params = [];

  // restrict to tasks in teams the user belongs to
  params.push(req.user.id);
  conditions.push(`t.team_id IN (SELECT team_id FROM team_members WHERE user_id = $${params.length})`);

  if (teamId) {
    params.push(teamId);
    conditions.push(`t.team_id = $${params.length}`);
  }
  if (assignee) {
    params.push(assignee);
    conditions.push(`t.assignee_id = $${params.length}`);
  }

  try {
    const { rows } = await pool.query(
      `SELECT t.id, t.title, t.description, t.team_id AS "teamId", t.assignee_id AS "assigneeId", t.due_date AS "dueDate", t.status, t.created_by AS "createdBy"
       FROM tasks t WHERE ${conditions.join(" AND ")} ORDER BY t.created_at DESC`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  const { error, value } = taskSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  try {
    const { rows } = await pool.query(
      `UPDATE tasks SET title=$1, description=$2, team_id=$3, assignee_id=$4, due_date=$5, status=$6
       WHERE id=$7
       RETURNING id, title, description, team_id AS "teamId", assignee_id AS "assigneeId", due_date AS "dueDate", status, created_by AS "createdBy"`,
      [value.title, value.description || "", value.teamId, value.assigneeId || null,
       value.dueDate || null, value.status, req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await pool.query("DELETE FROM tasks WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;