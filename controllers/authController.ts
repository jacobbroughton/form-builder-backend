import axios from "axios";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config.js";
import {
  clearSessionOnBackend,
  createSession,
  findAndUpdateUser,
  searchForExistingValidSession,
} from "../utils/authQueries.js";
import { getGoogleOAuthTokens } from "../services/googleOAuth.js";
import { decodeToken } from "../utils/decodeToken.js";

export const getMe = async (req: Request, res: Response) => {
  if (!req.cookies[config.jwtCookie]) return res.send(null);

  const decodedToken = decodeToken(req.cookies[config.jwtCookie]);

  return res.send(decodedToken);
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

    console.log("From google", { id_token, access_token, refresh_token, expires_in });

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
      return res.status(403).send("Google account is not verified");
    }

    console.log("found google user", googleUser);

    // upsert the user
    const user = await findAndUpdateUser(googleUser);

    // create a new session
    const session = await createSession({
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
        expiresIn: expires_in,
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
    return res.redirect("http://localhost:3000/error");
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    // clear session
    const decodedToken = <jwt.UserSessionCookiePayload>(
      decodeToken(req.cookies[config.jwtCookie])
    );

    res.clearCookie("form-builder-cookie");

    await clearSessionOnBackend({
      session_id: decodedToken.session.session_id,
    });

    // clear cookie
    // revoke access token from google
    // redirect to login page

    res.send({ message: "Logged out" });
  } catch (error) {
    console.error("Error logging out", error);
    return res.redirect("http://localhost:3000/swagggggg");
  }
};
