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

export type QueryConditions = string[] | string | number;
export type QueryWhereTypes = { or?: QueryConditions; and?: QueryConditions; } | null;
export type QuerySelectObject = Record<string, string>;
export type QuerySelectTypes = string[] | string | number | QuerySelectObject;
export type Numbers = number | null;

export type ColumnConfig = {
  allowed: string[];
  default: string[] | string;
};

export type GraphQLLimitConfig = {
  default: number;
  max: number;
};

export type GraphQLPagination = {
  limit: GraphQLLimitConfig;
  offset: { default: number };
};

export type GraphQLSorting = {
  columns: ColumnConfig;
  order: { allowed: string[]; default: string };
};

export type GraphQLResolver = {
  engine: 'sql' | 'nosql';
  type: string;
  table: string;
  columns: ColumnConfig;
  pagination: GraphQLPagination;
  sorting: GraphQLSorting;
  filter: { allowed: string[] };
};

export type GraphQLResponseShape = {
  shape: {
    rows: string;
    meta: Record<string, string>;
  };
};

export type QueryTypes = | {
  engine: 'rest';
  type?: string;
  table?: string;
  select?: QuerySelectTypes | any;
  where?: QueryWhereTypes;
  limit?: Numbers;
  offset?: Numbers;
} | {
  engine: 'graphql';
  arguments?: Record<string, string>;
  resolver?: GraphQLResolver;
  response?: GraphQLResponseShape;
}

export type BodyTypes = Record<string, any>;
export type InputRequiredTypes = string[];
export type InputMapTypes = Record<string, string | string[]>;
export type InptAuthTypes = Record<string, string> | null;
export type InputTypes = { 
  required?: InputRequiredTypes; 
  auth?: InptAuthTypes;  
  map?: InputMapTypes;
};
export type ResultDataTypes = | Record<string, unknown> | unknown[] | string | number | null;
export type ResultType = {
  success: boolean;
  msg?: string;
  data?: ResultDataTypes;
  error?: unknown;
};