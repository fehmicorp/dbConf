import { DbClient } from "./client";
import { DatabaseConfig } from "./types";

declare global {
  // eslint-disable-next-line no-var
  var __dbConfClient__: DbClient | undefined;
}

export function createDbClient(config: DatabaseConfig): DbClient {
  return new DbClient(config);
}

export function createNextDbClient(config: DatabaseConfig): DbClient {
  if (process.env.NODE_ENV === "production") {
    return new DbClient(config);
  }

  if (!globalThis.__dbConfClient__) {
    globalThis.__dbConfClient__ = new DbClient(config);
  }

  return globalThis.__dbConfClient__;
}
