import { Pool } from "pg";

export type DbConf = {
  dbUser: string;
  dbHost: string;
  dbName: string;
  dbPwd: string;
  dbPort: number;
  maxConnections?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
};

export function getDbPool(dbConf: DbConf){
  return new Pool({
    user: dbConf.dbUser,
    host: dbConf.dbHost,
    database: dbConf.dbName,
    password: dbConf.dbPwd,
    port: Number(dbConf.dbPort) || 5432,
    max: dbConf.maxConnections ? dbConf.maxConnections : 10,
    idleTimeoutMillis: dbConf.idleTimeoutMillis ? dbConf.idleTimeoutMillis : 30000,
    connectionTimeoutMillis: dbConf.connectionTimeoutMillis ? dbConf.connectionTimeoutMillis : 2000,
  });
}