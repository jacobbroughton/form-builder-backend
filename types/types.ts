import jwt from "jsonwebtoken";

export type InputTypeType = {
  id: number;
  name: string;
  description: string;
};

export type InputTypePropertyType = {
  id: number;
  input_type_id: number;
  property_name: string;
  property_description: string;
  property_type: string;
  value: string;
};

export type InputTypePropertyOptionType = {
  id: number;
  property_id: number;
  option_name: number;
  option_value: string;
  checked: boolean;
};

export type HashmapType = {
  [key: string]: object[];
};


declare module "jsonwebtoken" {
  export interface UserSessionCookiePayload extends jwt.JwtPayload {
    user: {
      id: string;
      username: string | null;
      name: string;
      email: string;
      picture: string;
      created_at: string;
      modified_at: string | null;
    };
    session: {
      session_id: string;
      user_id: string;
      expires_at: string;
      is_active: boolean;
    };
    iat: number;
    exp: number;
  }
}
