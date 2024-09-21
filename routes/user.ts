import * as express from "express";
import * as jwt from "jsonwebtoken";
import { config } from "../config/config";

const router = express.Router();

router.get("/me", async (req, res) => {
  console.log(req.cookies[config.jwtCookie])

  const decoded = jwt.verify(req.cookies[config.jwtCookie], process.env.SESSION_SECRET!);

  return res.send(decoded);
});

export default router;
