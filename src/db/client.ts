import {
  Pool,
  PoolClient,
  PoolConfig,
  QueryResult,
  QueryResultRow,
} from "pg";
import {
  ConnectionMode,
  DatabaseConfig,
  ExecuteQueryOptions,
  QueryParams,
  SelectQueryOptions,
  TransactionCallback,
} from "./types";

function buildPoolConfig(config: DatabaseConfig["read"]): PoolConfig {
  return {
    connectionString: config.connectionString,
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    ssl: config.ssl,
    max: config.max ?? 10,
    idleTimeoutMillis: config.idleTimeoutMillis ?? 30000,
    connectionTimeoutMillis: config.connectionTimeoutMillis ?? 5000,
    statement_timeout: config.statement_timeout,
  };
}

export class DbClient {
  private readonly readPool: Pool;
  private readonly writePool: Pool;

  constructor(private readonly config: DatabaseConfig) {
    this.readPool = new Pool(buildPoolConfig(config.read));
    this.writePool = new Pool(buildPoolConfig(config.write));
  }

  private getPool(mode: ConnectionMode): Pool {
    return mode === "write" ? this.writePool : this.readPool;
  }

  async select<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params: QueryParams = [],
    options: SelectQueryOptions = {},
  ): Promise<T[]> {
    const mode = options.mode ?? "read";
    const result = await this.getPool(mode).query<T>(sql, [...params]);
    return result.rows;
  }

  async execute(
    sql: string,
    params: QueryParams = [],
    options: ExecuteQueryOptions = {},
  ): Promise<QueryResult> {
    const mode = options.mode ?? "write";
    return this.getPool(mode).query(sql, [...params]);
  }

  async transaction<T>(callback: TransactionCallback<T>): Promise<T> {
    const client = await this.writePool.connect();

    try {
      await client.query("BEGIN");
      const result = await callback({
        query: async <R extends QueryResultRow = QueryResultRow>(
          sql: string,
          params: QueryParams = [],
        ): Promise<R[]> => {
          const queryResult = await client.query<R>(sql, [...params]);
          return queryResult.rows;
        },
      });
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await this.rollback(client);
      throw error;
    } finally {
      client.release();
    }
  }

  async healthcheck(): Promise<{ read: boolean; write: boolean }> {
    const [read, write] = await Promise.all([
      this.pingPool(this.readPool),
      this.pingPool(this.writePool),
    ]);

    return { read, write };
  }

  async close(): Promise<void> {
    await Promise.all([this.readPool.end(), this.writePool.end()]);
  }

  private async pingPool(pool: Pool): Promise<boolean> {
    try {
      await pool.query("SELECT 1");
      return true;
    } catch {
      return false;
    }
  }

  private async rollback(client: PoolClient): Promise<void> {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Ignore rollback errors and rethrow original transaction failure.
    }
  }
}
