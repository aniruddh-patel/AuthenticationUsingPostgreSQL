import pool from "../Connections/PostgresDB.js";
export const insertUserToken = async (userId, token) => {
  const MAX_TOKENS = 2;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
        const { rows } = await client.query(
        "SELECT id FROM user_tokens WHERE user_id = $1 ORDER BY created_at ASC",
        [userId]
        );

        if (rows.length >= MAX_TOKENS) {
            const oldestId = rows[0].id;
            await client.query("DELETE FROM user_tokens WHERE id = $1", [oldestId]);
        }

        await client.query("INSERT INTO user_tokens (user_id, token) VALUES ($1, $2)",[userId, token]);
    await client.query("COMMIT");
    return true;
  } catch (err) {
    await client.query("ROLLBACK");
        console.error("Token insert error:", err);
          return false;
  } finally {
    client.release();
  }
};

