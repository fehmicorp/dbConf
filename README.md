# dbConf

`dbConf` is a Next.js-friendly database package that gives you one place to manage **read** and **write** PostgreSQL connections.

It is designed for teams that want:
- a clean single package for DB access,
- explicit read/write routing,
- transaction helpers,
- easy reuse in Next.js API routes, Route Handlers, and server actions.

---

## Features

- ✅ Separate **read pool** and **write pool** configuration
- ✅ Strong TypeScript types
- ✅ `select(...)` helper (defaults to read)
- ✅ `execute(...)` helper (defaults to write)
- ✅ Transaction wrapper (`transaction(...)`)
- ✅ Health check (`healthcheck()`)
- ✅ Next.js development singleton (`createNextDbClient(...)`) to avoid extra connections in hot-reload

---

## Installation

```bash
npm install fc-dbconf_next
```

---

## Quick Start (Next.js)

Create a shared DB module, for example `src/lib/db.ts`:

```ts
import { createNextDbClient } from "fc-dbconf_next";

export const db = createNextDbClient({
  read: {
    connectionString: process.env.POSTGRES_READ_URL,
    max: 10,
  },
  write: {
    connectionString: process.env.POSTGRES_WRITE_URL,
    max: 10,
  },
});
```

Use it in a route handler (`app/api/users/route.ts`):

```ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const users = await db.select<{ id: number; email: string }>(
    "SELECT id, email FROM users ORDER BY id DESC LIMIT $1",
    [20],
  );

  return NextResponse.json({ success: true, data: users });
}

export async function POST(req: Request) {
  const body = await req.json();

  await db.execute(
    "INSERT INTO users(email, name) VALUES ($1, $2)",
    [body.email, body.name],
  );

  return NextResponse.json({ success: true });
}
```

---

## API

### `createDbClient(config)`
Creates a new DB client instance.

### `createNextDbClient(config)`
Creates a singleton in development and a fresh client in production. Recommended for Next.js.

### `db.select<T>(sql, params?, options?)`
- Returns typed rows (`T[]`)
- Default mode: `read`

Example:

```ts
const rows = await db.select<{ id: number }>(
  "SELECT id FROM users WHERE status = $1",
  ["active"],
);
```

### `db.execute(sql, params?, options?)`
- Executes write/update/delete statements
- Returns PostgreSQL `QueryResult`
- Default mode: `write`

### `db.transaction(async (tx) => { ... })`
Runs all queries in a transaction using the write connection.

```ts
await db.transaction(async (tx) => {
  await tx.query("UPDATE accounts SET balance = balance - $1 WHERE id = $2", [100, 1]);
  await tx.query("UPDATE accounts SET balance = balance + $1 WHERE id = $2", [100, 2]);
});
```

### `db.healthcheck()`
Returns:

```ts
{ read: boolean; write: boolean }
```

### `db.close()`
Gracefully closes both pools.

---

## Config Type

```ts
type DatabaseConfig = {
  read: DatabaseConnectionConfig;
  write: DatabaseConnectionConfig;
};

type DatabaseConnectionConfig = {
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
```

You can configure connections with either full connection strings or separate host/user/password/database fields.

---

## Environment Variables Example

```env
POSTGRES_READ_URL=postgres://readonly_user:password@localhost:5432/app_db
POSTGRES_WRITE_URL=postgres://writer_user:password@localhost:5432/app_db
```

---

## Notes

- This package still exports the previous REST/GraphQL utilities for backward compatibility.
- For serverless deployments, use connection pooling services where appropriate.

---

## Publishing

This package is publish-ready for npm.

```bash
npm install
npm run build
npm run test
npm run publish:public
```

For a complete release checklist, see [`docs/PUBLISHING.md`](docs/PUBLISHING.md).

---

## License

MIT
