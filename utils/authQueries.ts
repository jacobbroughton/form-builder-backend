import { pool } from "../config/database.js";

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
        returning *
        `,
        [googleUser.name, googleUser.email, googleUser.picture]
      );

      if (!result) throw new Error("There was an error inserting the user");

      return result.rows[0];
    }

    return result.rows[0];
  } catch (error) {
    console.error(error);
  }
}

export async function createSession({
  user_id,
  access_token,
  refresh_token,
  user_agent,
  expires_in,
}: {
  user_id: string;
  access_token: string;
  refresh_token: string;
  user_agent: string;
  expires_in: number;
}): Promise<{
  session_id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  user_agent: string;
  is_active: boolean;
  expires_at: Date;
  created_at: Date;
  updated_at: Date;
} | null> {
  try {
    // Set expired sessions to inactive
    const result = await pool.query(`
      update sessions
      set is_active = false
      where expires_at < now()
    `);

    if (!result) throw new Error("There was an error setting old sessions to 'expired'");

    // Create a new session
    // Allowing multiple sessions in case the user is signed in on multiple devices
    const result2 = await pool.query(
      `
      insert into sessions
        (user_id, 
        access_token, 
        refresh_token, 
        user_agent, 
        is_active, 
        expires_at, 
        created_at, 
        updated_at)
      values (
        $1, 
        $2, 
        $3, 
        $4, 
        true, 
        ${`now() + (${expires_in} * interval '1 ms')`}, 
        now(), 
        now()
      )
      returning *
  `,
      [user_id, access_token, refresh_token, user_agent]
    );

    if (!result2) throw new Error("There was an error adding user session");

    return result2.rows[0];
  } catch (error) {
    console.error("here", error);
  }

  return null;
}

export async function clearSessionOnBackend({
  session_id,
}: {
  session_id: string | null;
}): Promise<void> {
  try {
    let result;

    if (session_id) {
      result = await pool.query(
        `
        update sessions
        set is_active = false,
        updated_at = now()
        where session_id = $1
        returning *
      `,
        [session_id]
      );
    } else {
      result = await pool.query(
        `
        update sessions
        set is_active = false,
        updated_at = now()
        where expires_at < now()
      `
      );
    }

    if (!result) throw new Error("Session was not cleared");
  } catch (error) {
    console.log(error);
  }
}

export async function destorySessionsForUser(userId: string) {
  try {
    const result = await pool.query(
      `
      update sessions
      set is_active = false,
      updated_at = now()
      where user_id = $1
    `,
      [userId]
    );

    if (!result) throw new Error("Session was not cleared");
  } catch (error) {
    console.log(error);
  }
}

export async function searchForExistingValidSession({
  userId,
}: {
  userId: string;
}): Promise<{
  session_id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  user_agent: string;
  is_active: boolean;
  expires_at: string;
} | null> {
  try {
    const result = await pool.query(
      `
      select * from sessions
      where user_id = $1
      and is_active = true
      and expires_at < now()
    `,
      [userId]
    );

    if (!result) throw new Error("There was an error looking for existing valid session");

    if (!result.rows[0]) return null;

    return result.rows[0];
  } catch (error) {
    console.error(error);
  }

  return null;
}

export async function getSessionById(sessionId: string) {
  try {
    const result = await pool.query(
      `
      select * from sessions
      where session_id = $1
    `,
      [sessionId]
    );

    if (!result) throw new Error("There was an error looking for existing valid session");

    return result.rows[0];
  } catch (error) {
    console.error(error);
  }

  return null;
}

export async function extendSession(session_id: string, expiresInMs: number) {
  try {
    const result = await pool.query(
      `
      update sessions
      set expires_at = ${`now() + (${expiresInMs} * interval '1 ms')`}
      where session_id = $1
      returning *
    `,
      [session_id]
    );

    if (!result) throw new Error("There was an error looking for existing valid session");

    return result.rows[0];
  } catch (error) {
    console.error(error);
  }
}
