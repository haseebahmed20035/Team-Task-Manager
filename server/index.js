import express from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import dotenv from "dotenv";
import { pool, initDb } from "./db.js";
import passport from "./passport.js";
import authRoutes from "./routes/auth.js";
import teamRoutes from "./routes/teams.js";
import taskRoutes from "./routes/tasks.js";

dotenv.config();
const app = express();

app.set("trust proxy", 1); // for Cloud Run / production behind proxy

const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://teamtaskmanager-141d5.web.app",
  "https://teamtaskmanager-141d5.firebaseapp.com",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, curl, same-origin)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

const PgSession = connectPgSimple(session);
const sessionStore = process.env.DATABASE_URL
  ? new PgSession({ pool, tableName: "session" })
  : undefined; // falls back to MemoryStore in dev if no DB

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/api/auth", authRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (_, res) => res.send("API running"));

const PORT = process.env.PORT || 5000;
initDb()
  .then(() => app.listen(PORT, () => console.log(`Server on ${PORT}`)))
  .catch((err) => {
    console.error("DB init failed:", err);
    process.exit(1);
  });