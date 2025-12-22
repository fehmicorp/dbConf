import { Response } from "../restapi/response";
import { DbConf, getDbPool } from "./conf";
import { prepareQuery } from "../utils/query.build";
import { verifyPassword } from "../utils/bcrypt";

export const fetchDb = async (
  dbConf: DbConf,
  query: any,
  input: any,
  body: Array<any>,
) => {
  let pool;
  // Implement the logic to fetch data from the database using the provided dbConf, query, and body.
  try {
    // 1️⃣ Normalize body (array → object)
    if (Array.isArray(body)) {
      const ok = body.every(
        v => typeof v === "object" && v !== null && !Array.isArray(v)
      );
      if (!ok) {
        return Response.error("Invalid body format", 400);
      }
      body = Object.assign({}, ...body);
    }
    // 2️⃣ Prepare SQL + params + auth metadata
    const { sql, values, auth } = prepareQuery(query, input, body);
    // 3️⃣ Execute query
    pool = getDbPool(dbConf);
    const dbResult = await pool.query(sql, values);
    // 4️⃣ No records found
    if (!dbResult.rows || dbResult.rows.length === 0) {
      return Response.failed("No record found", 200);
    }
    // 5️⃣ AUTH FLOW (verify after fetch)
    if (auth) {
      const row = dbResult.rows[0];
      const verifiedUser = await verifyPassword(row, auth, body);
      if (!verifiedUser) {
        return Response.failed("Invalid credentials", 401);
      }
      return Response.success(verifiedUser);
    }
    // 6️⃣ NORMAL FETCH FLOW
    return Response.success(dbResult.rows);
  }catch (err: any) {
    console.error("fetchDb error:", err);
    return Response.error(
      err?.message || "Database fetch error",
      500
    );
  } finally {
    // 7️⃣ Ensure pool is closed
    if (pool) {
      try {
        await pool.end();
      } catch {
      }
    }
  }
}