import { Pool } from "pg";

export type DbConf = {
  user: string;
  host: string;
  database: string;
  password: string;
  port: number;
  maxConnections?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
};

export function getDbPool(dbConf: DbConf){
  return new Pool({
    user: dbConf.user,
    host: dbConf.host,
    database: dbConf.database,
    password: dbConf.password,
    port: Number(dbConf.port) || 5432,
    max: dbConf.maxConnections ? dbConf.maxConnections : 10,
    idleTimeoutMillis: dbConf.idleTimeoutMillis ? dbConf.idleTimeoutMillis : 30000,
    connectionTimeoutMillis: dbConf.connectionTimeoutMillis ? dbConf.connectionTimeoutMillis : 2000,
  });
}