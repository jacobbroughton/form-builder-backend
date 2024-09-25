import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import { sessionStore } from "./config/database.js";

import FormRouter from "./routes/form.js";
import AuthRouter from "./routes/auth.js";

dotenv.config();

const app = express();

const origins = ["http://localhost:3000"];

app.options("*", cors({ credentials: true, origin: origins }));
app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000',
  })
);

app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.json());

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET!,
    proxy: true,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // one day
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : false,
    },
  })
);

app.use("/form", FormRouter);
app.use("/api/sessions", AuthRouter);

const port = 3001;

app.listen(port, () => console.log("Server listening at port 3001"));
