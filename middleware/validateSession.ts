import { NextFunction, Request, Response } from "express";
import { config } from "../config/config.js";
import { decodeToken } from "../utils/decodeToken.js";
import { UserSessionCookiePayload } from "jsonwebtoken";
import { getSessionById } from "../utils/authQueries.js";

export async function validateSession(req: Request, res: Response, next: NextFunction) {
  try {
    console.log("Request made: ", req.url);

    const token = req.cookies[config.jwtCookie];

    if (!token || token === undefined) {
      return res.status(401).send("Unauthorized: No session token");
    }

    const decoded = <UserSessionCookiePayload>decodeToken(token);

    // get session from db
    const session = await getSessionById(decoded.session.session_id);

    console.log("Found session", session);

    console.log({now: new Date().toLocaleString(), expires: new Date(session.expires_at).toLocaleString()})

    if (!session || !session.is_active || new Date() > new Date(session.expires_at))
      return res.status(401).send("Unauthorized: Expired or invalid session");

    req.user = decoded.user;
    // req.session = session;

    console.log("req.session", req.session);

    next();
  } catch (error: any) {
    console.error(error);
    res.status(500).send("Fatal error: " + error.toString());
  }
}
