import { QuerySelectTypes, QueryTypes, QueryConditions, InputTypes, BodyTypes, InptAuthTypes, QueryWhereTypes } from "./data.type";
import { buildIdentityParams } from "./params.build";

export const buildQuery = (query: QueryTypes, auth: InptAuthTypes) => {
  if (!query?.table) {
    throw new Error("Table name is required");
  }
  const selectStr = buildSelect(query?.select, auth ?? null);
  const whereStr = buildWhere(query?.where);
  let sql = `SELECT ${selectStr} FROM ${query.table}`;
  if (whereStr) {
    sql += ` WHERE ${whereStr}`;
  }
  return sql;
};
export const prepareQuery = (query: QueryTypes, input: InputTypes, body: BodyTypes) => {
  const sql = buildQuery(query, input?.auth ?? null)
  const params = buildIdentityParams(body, input);
  const values: any[] = [];
  let i = 1;
  const transformedSql = sql.replace(/:(\w+)/g, (match, key) => {
    if (key in params) {
      values.push(params[key]);
      return `$${i++}`;
    }
    return match;
  });
  const authParams = input?.auth ?? null;
  // const authValue = authParams ? getAuthValue(authParams, body) : null;
  return { sql: transformedSql, values, auth: authParams};
};

// export const getAuthValue = (
//   auth: any,
//   body: any
// ): Record<string, any> => {
//   const authValue: Record<string, any> = {};
//   if (!auth || typeof auth !== "object" || !body || typeof body !== "object") {
//     return authValue;
//   }
//   Object.keys(auth).forEach((key) => {
//     // 3️⃣ Check if the incoming body has this specific key
//     if (Object.prototype.hasOwnProperty.call(body, key)) {
//       authValue[key] = body[key];
//     }
//   });
//   return authValue
// }

export const buildSelect = (
  select: QuerySelectTypes,
  auth: InptAuthTypes
): string => {
  // 1️⃣ COUNT → never append auth
  if (select === 0) {
    return "COUNT(*) AS count";
  }
  let cols: string[] = [];
  if (Array.isArray(select) && select.length > 0) {
    cols = [...select];
  } else if (typeof select === "string" && select.trim() !== "" && select !== "*") {
    cols = select.split(",").map(c => c.trim());
  } else {
    // "*" or undefined → do not append auth
    return "*";
  }
  
  // 3️⃣ Append auth DB columns (values only)
  if (auth && typeof auth === "object") {
    const authColumns = Object.values(auth);
    for (const dbCol of authColumns) {
      if (dbCol) {
        cols.push(dbCol);
      }
    }
  }
  const uniqueCols = Array.from(new Set(cols));
  return uniqueCols.join(", ");
};


export const buildWhere = (
  where?: QueryWhereTypes
): string | null => {
  if (!where) return null;
  const clauses: string[] = [];
  if (where.or) {
    clauses.push(whereOR(where.or));
  }
  if (where.and) {
    clauses.push(whereAND(where.and));
  }
  return clauses.join(" AND ");
};

export const whereAND = (
  condition: QueryConditions
): string => {
  if (Array.isArray(condition)) {
    return condition.map(col => `${col} = :${col}`).join(" AND ");
  }
  return `${condition} = :${condition}`;
};

export const whereOR = (
  condition: QueryConditions
): string => {
  if (Array.isArray(condition)) {
    return `(${condition.map(col => `${col} = :${col}`).join(" OR ")})`;
  }
  return `(${condition} = :${condition})`;
};
