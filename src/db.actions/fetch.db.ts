import { Response } from "../restapi/response";
import { DbConf, getDbPool } from "./conf";
import { buildQuery } from "../utils/query.build";
import { buildParams } from "../utils/params.build";

export const fetchDb = async (
  dbConf: DbConf,
  query: any,
  input: any,
  body: Array<any>,
) => {
  // Implement the logic to fetch data from the database using the provided dbConf, query, and body.
  const pool = getDbPool(dbConf);
  if (Array.isArray(body)) {
    const ok = body.every(
      v => typeof v === "object" && v !== null && !Array.isArray(v)
    );
    if (!ok) {
      return Response.error("Invalid body format", 400);
    }
    body = Object.assign({}, ...body);
  }
  const sql = buildQuery(query);
  const params = buildParams(body, input);
  const dbResult = await pool.query(sql, params);
}