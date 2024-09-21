import * as express from "express";
import { Request, Response } from "express";
import { getGoogleOAuthTokens, getGoogleUser } from "../utils/googleOAuthFuncs";
import { findAndUpdateUser } from "../utils/findAndUpdateUser";
import { config } from "../config/config";
import { signJwt } from "../utils/signJwt";
import { pool } from "../config/database";
import * as jwt from "jsonwebtoken"

const router = express.Router();

router.get("/oauth/google", async (req: Request, res: Response) => {
  try {
    // get code from query string
    const code = req.query.code as string;

    // get the id and access token with the code
    const { id_token, access_token } = await getGoogleOAuthTokens({ code });

    // get user with tokens
    const googleUser = await getGoogleUser({
      id_token,
      access_token,
    });

    if (!googleUser.verified_email) {
      return res.status(403).send("Google account is not verified");
    }

    console.log("found google user", googleUser);

    // upsert the user
    const user = await findAndUpdateUser(googleUser);
 
    const token = jwt.sign(user, process.env.SESSION_SECRET!)

    res.cookie(config.jwtCookie, token, {
      maxAge: 900000,
      httpOnly: true,
      secure: false
    })

    res.redirect('http://localhost:3000')

    // create a session
    // const sessionResult = await pool.query(`
      
    // `)
    
    // const session = await createSession(user.id, req.get("user-agent") || "");

    // create an access token
    // const accessToken = signJwt(
    //   { ...user, session: session.id },
    //   { expiresIn: config.accessTokenTtl } // 15 minutes
    // );

    // // create a refresh token
    // const refreshToken = signJwt(
    //   { ...user, session: session.id },
    //   { expiresIn: config.refreshTokenTtl } // 1 year
    // );

    // set cookies
    // redirect back to client
  } catch (error) {
    console.error(error);
    return res.redirect("http://localhost:3000/error");
  }
});

export default router;
