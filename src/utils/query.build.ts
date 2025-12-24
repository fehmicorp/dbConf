import { QuerySelectTypes, QueryTypes, QueryConditions, InputTypes, BodyTypes, InptAuthTypes, QueryWhereTypes } from "./data.type";
import { buildIdentityParams } from "./params.build";

export const buildQuery = (query: any, auth: InptAuthTypes | null) => {
  if (!query?.table) {
    throw new Error("Table name is required");
  }

  const selectStr = buildSelect(query?.select, auth);
  const whereStr = buildWhere(query?.where);
  
  let sql = `SELECT ${selectStr} FROM ${query.table}`;
  
  if (whereStr) {
    sql += ` WHERE ${whereStr}`;
  }

  // Handle Pagination for both REST and GraphQL
  if (query.limit) sql += ` LIMIT ${query.limit}`;
  if (query.offset) sql += ` OFFSET ${query.offset}`;

  return sql;
};

export const prepareQuery = (query: QueryTypes, input: InputTypes | null, body: BodyTypes) => {
  const sql = buildQuery(query, input?.auth ?? null);

  // Determine params source
  // If GraphQL, we use the filter object. If REST, we use the identity builder.
  const params = query.engine === 'graphql' 
    ? (body.filter ?? body) 
    : buildIdentityParams(body, input!);
  console.log(`Params: ${params}`)
  console.log(`Sql: ${sql}`)
  const values: any[] = [];
  let i = 1;

  // REPLACEMENT LOGIC
  const transformedSql = sql.replace(/:(\w+)/g, (match, key) => {
    // IMPORTANT: In your trigger, you sent 'name', but the SQL likely 
    // expects 'fullname', 'displayname', etc. based on your redis map.
    if (params && params[key] !== undefined) {
      values.push(params[key]);
      return `$${i++}`;
    }
    
    // If the key is missing in params, we must remove the condition or 
    // provide a NULL to avoid the PostgreSQL syntax error near ":"
    console.warn(`Missing value for SQL placeholder: :${key}`);
    values.push(null); 
    return `$${i++}`; 
  });

  return { 
    sql: transformedSql, 
    values, 
    auth: input?.auth ?? null 
  };
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
