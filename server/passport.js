import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { pool } from "./db.js";

passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      const user = rows[0];
      if (!user) return done(null, false, { message: "Invalid credentials" });
      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return done(null, false, { message: "Invalid credentials" });
      return done(null, { id: user.id, email: user.email, displayName: user.display_name });
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, email, display_name FROM users WHERE id = $1",
      [id]
    );
    if (!rows[0]) return done(null, false);
    done(null, { id: rows[0].id, email: rows[0].email, displayName: rows[0].display_name });
  } catch (err) {
    done(err);
  }
});

export default passport;