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

    if (!response) throw new Error("No response from googleapi");

    return response.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function getNewAccessToken({
  refresh_token,
}: {
  refresh_token: string;
}): Promise<{
  access_token: string | null;
  expires_in: number | null;
  scope: string | null;
  token_type: string | null;
  id_token: string | null;
}> {
  try {
    // fetching new access token with the refresh token from existing session
    const response = await axios.post(`https://oauth2.googleapis.com/token`, {
      client_id: config.googleClientId,
      client_secret: config.googleClientSecret,
      refresh_token,
      grant_type: "refresh_token",
    });

    if (!response) throw new Error ("No response from getNewAccessToken")

    return response.data;
  } catch (error: any) {
    console.error("Error refreshing access token", error.response.data);
    throw new Error(error.message);
  }
}

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiMWRhMmM2MDgtNzc1OS0xMWVmLThkY2ItYTI5YzkxZTI5MmMyIiwidXNlcm5hbWUiOm51bGwsIm5hbWUiOiJKYWNvYiBCcm91Z2h0b24iLCJlbWFpbCI6ImphY29iYnJvdWdodG9uZGV2QGdtYWlsLmNvbSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NJZFNpZUppWmxVNWFoY3d3ZWlkWThLbFZscEdyT00wRUZISmxUMTN2bFBqUXBLckNFPXM5Ni1jIiwiY3JlYXRlZF9hdCI6IjIwMjQtMDktMjBUMTQ6MDM6MzAuNDY2WiIsIm1vZGlmaWVkX2F0IjpudWxsfSwic2Vzc2lvbiI6eyJzZXNzaW9uX2lkIjoiMmMyYWNmZTQtN2IzZC0xMWVmLWE2NjYtYTI5YzkxZTI5MmMzIiwidXNlcl9pZCI6IjFkYTJjNjA4LTc3NTktMTFlZi04ZGNiLWEyOWM5MWUyOTJjMiIsImV4cGlyZXNfYXQiOiIyMDI0LTA5LTI1VDEzOjUzOjMyLjU5NFoiLCJpc19hY3RpdmUiOnRydWV9LCJpYXQiOjE3MjcyNjg4MTMsImV4cCI6MTcyNzM1NTIxM30.jg1UWX_5iVK4Aq8xDv6-4o8qAIF3q9IBge-OCsgpAAs

// eyJhbGciOiJSUzI1NiIsImtpZCI6IjVhYWZmNDdjMjFkMDZlMjY2Y2NlMzk1YjIxNDVjN2M2ZDQ3MzBlYTUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI2NjU0Mjc4MzY0NTQtMzM1MGo0ZWM0bmI2amhvYWw3djQ2YnNrZ2EybnBwN2YuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI2NjU0Mjc4MzY0NTQtMzM1MGo0ZWM0bmI2amhvYWw3djQ2YnNrZ2EybnBwN2YuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDQxOTQxNjU0ODUyNzIxNjUxMzgiLCJlbWFpbCI6ImphY29iYnJvdWdodG9uZGV2QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoiWjMyWFltNzZlVkR4Ni1BVEh4bXhMdyIsIm5hbWUiOiJKYWNvYiBCcm91Z2h0b24iLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EvQUNnOG9jSWRTaWVKaVpsVTVhaGN3d2VpZFk4S2xWbHBHck9NMEVGSEpsVDEzdmxQalFwS3JDRT1zOTYtYyIsImdpdmVuX25hbWUiOiJKYWNvYiIsImZhbWlseV9uYW1lIjoiQnJvdWdodG9uIiwiaWF0IjoxNzI3MjY4ODEzLCJleHAiOjE3MjcyNzI0MTN9.fr8K-qmDJh_wdXbpnDQbsRzAq5IGU0nO6PgglyMN9Kadkcp4IwvyseSTR7EECA6btYla7n0XzCDz30MUz4Cq4dFu3IqNCjYcWqr8z3tOof-_jP5hils221-URb934GX0q2SpsiJ10C3APUrfKiIpiKO9KhZGNhDUElw53Kk2zCsIS8avmvjswXViFfbeZgyik_1Xg_CE8Gh9_KoOkmDjLFf51lAT8LanTCCboWXMwW7YsPuC5S6XQEsMsKNHarAuFXbCGgSzYlfRlYf85WJGSoHpXYLMIWaRN44bQKnyGcTerDeocn6nh9YsKtoauHaHIfecqREjtjjI_Ezgk2Rszg
