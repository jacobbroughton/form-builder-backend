import axios from "axios";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import { getGoogleOAuthTokens } from "../services/googleOAuth.js";
import {
  createSession,
  destorySessionsForUser,
  findAndUpdateUser,
} from "../utils/authQueries.js";
import { decodeToken } from "../utils/decodeToken.js";

export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.cookies[config.jwtCookie]) return res.status(200).json({ user: null });

    const decodedToken = decodeToken(req.cookies[config.jwtCookie]);

    return res.send({ user: decodedToken.user });
  } catch (error) {
    console.error(error);
  }
};

export const logInGoogleOAuth = async (req: Request, res: Response) => {
  try {
    // get code from query string
    const code = req.query.code as string;

    // get the id and access token with the code
    const { id_token, access_token, refresh_token, expires_in } =
      await getGoogleOAuthTokens({
        code,
      });

    // get user with tokens
    // id_token tells google that we are who we are
    // access token is to tell google that we want the user info
    const response = await axios(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
      {
        headers: {
          authorization: `Bearer ${id_token}`,
        },
      }
    );

    const googleUser = response.data;

    if (!googleUser.verified_email) {
      return res.status(403).json({ message: "Google account is not verified" });
    }

    // upsert the user
    const user = await findAndUpdateUser(googleUser);

    if (!user) throw new Error("No user was found");

    await destorySessionsForUser(user.id);

    // create a new session
    let session = await createSession({
      user_id: user.id,
      access_token,
      refresh_token,
      user_agent: req.get("user-agent") || "",
      expires_in: expires_in * 1000,
    });

    if (!session) throw new Error("Session was not created");

    const { session_id, user_id, expires_at, is_active } = session;

    const sessionToken = jwt.sign(
      { user, session: { session_id, user_id, expires_at, is_active } },
      process.env.SESSION_SECRET!,
      {
        expiresIn: "24h",
      }
    );

    res.cookie(config.jwtCookie, sessionToken, {
      maxAge: expires_in * 1000, // conv seconds to ms
      httpOnly: true,
      secure: process.env.NODE_ENV === "development" ? false : true,
    });

    console.log("Created session", session);

    // redirect back to client
    res.redirect("http://localhost:3000/dashboard");
  } catch (error) {
    console.error(error);
    return res.redirect("http://localhost:3000/google-oauth-error");
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    let decodedToken = null;
    console.log("req.user at logout", req.user);

    if (req.user && req.user.id) await destorySessionsForUser(req.user.id);

    if (req.cookies[config.jwtCookie]) {
      // clear session
      decodedToken = <jwt.UserSessionCookiePayload>(
        decodeToken(req.cookies[config.jwtCookie])
      );

      if (!req.user && decodedToken && decodedToken.user.id)
        await destorySessionsForUser(decodedToken.user.id);

      res.clearCookie("form-builder-cookie");
    }

    res.send({ message: "Logged out" });
  } catch (error) {
    console.error("Error logging out", error);
    return res.redirect("http://localhost:3000/");
  }
};
