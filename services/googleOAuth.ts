import qs from "qs";
import { config } from "../config/config.js";
import axios from "axios";

interface GoogleTokensResult {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  id_token: string;
}

export async function getGoogleOAuthTokens({
  code,
}: {
  code: string;
}): Promise<GoogleTokensResult> {
  const url = "https://oauth2.googleapis.com/token";
  const values = {
    code,
    client_id: config.googleClientId,
    client_secret: config.googleClientSecret,
    redirect_uri: config.googleOAuthRedirectUrl,
    grant_type: "authorization_code",
  };

  try {
    const response = await axios.post(url, qs.stringify(values), {
      method: "post",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    });

    return response.data;
  } catch (error: any) {
    console.error(error);
    return error;
  }
}

interface GoogleUserResult {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export async function getGoogleUser({
  id_token,
  access_token,
}: {
  id_token: string;
  access_token: string;
}): Promise<GoogleUserResult> {
  try {
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

    return response.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getNewAccessToken({
  refresh_token,
}: {
  refresh_token: string;
}): Promise<GoogleUserResult> {
  try {
    // fetching new access token with the refresh token from existing session
    const response = await axios.post(`https://oauth2.googleapis.com/token`, {
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token,
      grant_type: "refresh_token",
    });

    return response.data;
  } catch (error: any) {
    console.error("Error refreshing access token", error.response.data);
    throw new Error(error.message);
  }
}
