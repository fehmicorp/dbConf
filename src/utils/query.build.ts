export const buildQuery = (query: any) => {
  if (!query?.table) {
    throw new Error("Table name is required");
  }
  const selectStr = buildSelect(query?.select);
  const whereStr = buildWhere(query?.where);
  let sql = `SELECT ${selectStr} FROM ${query.table}`;
  if (whereStr) {
    sql += ` WHERE ${whereStr}`;
  }
  return sql;
};

export const buildSelect = (
  select: Array<string> | string | number | undefined
): string => {
  if (select === 0) {
    return "COUNT(*) AS count";
  }
  if (Array.isArray(select) && select.length > 0) {
    return select.join(", ");
  }
  if (typeof select === "string" && select.trim() !== "") {
    return select;
  }
  return "*";
};

export const buildWhere = (
  where?: {
    or?: string[] | string;
    and?: string[] | string;
  }
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
  condition: string[] | string
): string => {
  if (Array.isArray(condition)) {
    return condition.map(col => `${col} = :${col}`).join(" AND ");
  }
  return `${condition} = :${condition}`;
};

export const whereOR = (
  condition: string[] | string
): string => {
  if (Array.isArray(condition)) {
    return `(${condition.map(col => `${col} = :${col}`).join(" OR ")})`;
  }
  return `(${condition} = :${condition})`;
};
