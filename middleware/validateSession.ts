import { NextFunction, Request, Response } from "express";
import { config } from "../config/config.js";
import { decodeToken } from "../utils/decodeToken.js";
import { UserSessionCookiePayload } from "jsonwebtoken";
import {
  destorySessionsForUser,
  extendSession,
  getSessionById,
} from "../utils/authQueries.js";
import { getNewAccessToken } from "../services/googleOAuth.js";
import { pool } from "../config/database.js";
import jwt from "jsonwebtoken";

export async function validateSession(req: Request, res: Response, next: NextFunction) {
  try {
    console.log("Request made: ", req.url);

    const token = req.cookies[config.jwtCookie];

    if (!token || token === undefined) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No session token", redirect: "/login" });
    }

    const decoded = <UserSessionCookiePayload>decodeToken(token);

    let session = await getSessionById(decoded.session.session_id);

    if (!session || !session.is_active || new Date() > new Date(session.expires_at)) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Expired or invalid session" });
    }

    // const existingActiveSessionResult = await pool.query(
    //   `
    //   select * from sessions
    //   where is_active = true
    //   and user_id = $1
    //   order by updated_at desc, created_at desc
    //   limit 1
    // `,
    //   [user.id]
    // );

    // if (!existingActiveSessionResult)
    //   throw new Error("Error searching for existing active session");

    // if expiring in less than one hour
    if (
      (new Date(session.expires_at).getTime() - new Date().getTime()) *
      (60 * 60 * 1000)
    ) {
      let newTokens: Partial<{
        access_token: string | null;
        expires_in: number | null;
        scope: string | null;
        token_type: string | null;
        id_token: string | null;
      }> = await getNewAccessToken({
        refresh_token: session.refresh_token,
      });

      // Extend by one day
      const sessionResult = await pool.query(
        `
        update sessions
        set access_token = $1,
        expires_at = ${`now() + (86400000 * interval '1 ms')`}  
        where is_active = true
        and user_id = (
          select user_id from sessions 
          where is_active = true 
          and user_id = $2
          order by updated_at desc, created_at desc
          limit 1
        )
        returning *
      `,
        [newTokens.access_token, decoded.user.id]
      );

      if (!sessionResult)
        throw new Error("There was an error updating cookie with new tokens");

      session = sessionResult.rows[0];
    } else {
      // if valid session, extend expiration date of session
      let { expires_at } = await extendSession(session.session_id, 86400000); // extend by one day
      req.session?.cookie._expires = expires_at;
    }

    const { session_id, user_id, expires_at, is_active } = session;

    const sessionToken = jwt.sign(
      { user: decoded.user, session: { session_id, user_id, expires_at, is_active } },
      process.env.SESSION_SECRET!,
      {
        expiresIn: "24h",
      }
    );

    res.cookie(config.jwtCookie, sessionToken, {
      maxAge: 86400000, // conv seconds to ms
      httpOnly: true,
      secure: process.env.NODE_ENV === "development" ? false : true,
    });

    req.user = decoded.user;

    next();
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: `Fatal error: ${error.toString()}` });
  }
}
