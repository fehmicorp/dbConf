import { getDbPool } from "./conf";
import { prepareQuery } from "../utils/query.build";
import { verifyPassword } from "../utils/bcrypt";
import { 
  BodyTypes, 
  DbConf, 
  InputTypes, 
  QueryTypes, 
  ResultType 
} from "../utils/data.type";

export const fetchDb = async (
  dbConf: DbConf,
  query: QueryTypes,
  input: InputTypes,
  body: BodyTypes,
): Promise<ResultType> => {
  let pool;
  let normalizedBody = body;

  try {
    // 1️⃣ Normalize body (array → object)
    if (Array.isArray(normalizedBody)) {
      const isItemsValid = normalizedBody.every(
        v => typeof v === "object" && v !== null && !Array.isArray(v)
      );

      if (!isItemsValid) {
        return { 
          success: false, 
          msg: "Invalid body format: expected an array of objects", 
          error: { code: 400 } 
        };
      }
      normalizedBody = Object.assign({}, ...normalizedBody);
    }

    // 2️⃣ Prepare SQL + params + auth metadata
    const { sql, values, auth } = prepareQuery(query, input, normalizedBody);

    // 3️⃣ Execute query
    pool = getDbPool(dbConf);
    const dbResult = await pool.query(sql, values);

    // 4️⃣ No records found
    if (!dbResult.rows || dbResult.rows.length === 0) {
      return { 
        success: false, 
        msg: "No record found", 
        data: null, 
        error: { code: 200 } // Logic: Success true/false is for "found", but HTTP is 200
      };
    }

    // 5️⃣ AUTH FLOW (verify after fetch)
    if (auth) {
      const row = dbResult.rows[0];
      const verifiedUser = await verifyPassword(row, auth, normalizedBody);
      
      if (!verifiedUser) {
        return { 
          success: false, 
          msg: "Invalid credentials", 
          error: { code: 401 } 
        };
      }
      return { success: true, data: verifiedUser };
    }

    // 6️⃣ NORMAL FETCH FLOW
    return { success: true, data: dbResult.rows };

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Database fetch error";
    console.error("fetchDb error:", errorMessage);
    
    return { 
      success: false, 
      msg: errorMessage, 
      error: { code: 500, detail: err } 
    };
  } finally {
    // 7️⃣ Ensure pool is closed
    if (pool) {
      try {
        await pool.end();
      } catch (closeErr) {
        console.error("Pool close error:", closeErr);
      }
    }
  }
};