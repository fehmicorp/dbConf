import { PoolConfig, QueryResultRow } from "pg";

export type SqlPrimitive = string | number | boolean | Date | null;

export type QueryParams = readonly SqlPrimitive[];

export type ConnectionMode = "read" | "write";

export type DatabaseConnectionConfig = {
  connectionString?: string;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  ssl?: PoolConfig["ssl"];
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  statement_timeout?: number;
};

export type DatabaseConfig = {
  read: DatabaseConnectionConfig;
  write: DatabaseConnectionConfig;
};

export type QueryOptions = {
  mode?: ConnectionMode;
};

export type SelectQueryOptions = QueryOptions;

export type ExecuteQueryOptions = QueryOptions;

export type TransactionCallback<T> = (tx: {
  query<R extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: QueryParams,
  ): Promise<R[]>;
}) => Promise<T>;
