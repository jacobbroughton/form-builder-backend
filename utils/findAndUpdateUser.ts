import { pool } from "../config/database";

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

export async function findAndUpdateUser(googleUser: GoogleUserResult) {
  try {
    const result = await pool.query(
      `
      select * from users where email = $1  
    `,
      [googleUser.email]
    );

    if (!result) throw new Error("There was an error finding the user");

    if (!result.rows[0]) {
      const result = await pool.query(
        `
        insert into users (
          username,
          name,
          email,
          picture,
          created_at,
          modified_at
        ) values (
          null,
          $1,
          $2,
          $3,
          now(),
          null
        )
        `,
        [googleUser.name, googleUser.email, googleUser.picture]
      );

      if (!result) throw new Error("There was an error inserting the user");

      return result.rows;
    }

    return result.rows[0];
  } catch (error) {
    console.error(error);
  }
}
