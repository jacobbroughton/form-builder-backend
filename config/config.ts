export const config = {
  googleClientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
  googleOAuthRedirectUrl: process.env.GOOGLE_OAUTH_REDIRECT_URL,
  accessTokenTtl: "15m",
  refreshTokenTtl: "1y",
  publicKey: "",
  privateKey: "",
  jwtCookie: "form-builder-cookie",
};
