import * as express from "express";
import * as cors from "cors";
import * as cookieParser from "cookie-parser";
import * as session from "express-session";
import * as dotenv from "dotenv";
import { pool, sessionStore } from "./config/database";

dotenv.config();

const app = express();

const origins = ["http://localhost:3000"];

app.options("*", cors({ credentials: true, origin: origins }));
app.use(
  cors({
    credentials: true,
    origin: origins,
  })
);

app.use(cookieParser(process.env.SESSION_SECRET))
app.use(express.json())

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

async function testPool() {
  try {
    const result = await pool.query('select * from field_data_types')
    console.log(result)
  } catch (error) {
    console.error(error);
  }
}

testPool()


app.get("/", (req, res) => {
  
  res.send("Hello world");
});

const port = 3001;

app.listen(port, () => console.log("Server listening at port 3000"));
