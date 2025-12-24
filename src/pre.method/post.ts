import { BodyTypes, ResultType } from '../utils/data.type';
import { NextRequest } from "next/server";
import { redisData } from "../utils/header";
import { fetchDb } from "../db.actions/fetch.db";
import sendResponse from '../post.method/sendResponse';

export default async function handlePost(req: NextRequest) {
  const redis = await redisData(req);
  const queryEngine = redis?.query?.engine;
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  let result: ResultType;
  switch (queryEngine) {
    case 'rest':
      result = await restApi(redis, body);
      break;

    case 'graphql':
      result = await graphQL(redis, body);
      break;

    default:
      result = { success: false, msg: "Engine type not found" }
  }
  
  return sendResponse(result);
}

export async function graphQL(redis: any, body: BodyTypes): Promise<ResultType> {
  const { dbConf, query, input } = redis;

  if (query.engine !== 'graphql' || !query.resolver) {
    return { success: false, msg: "Invalid GraphQL configuration", error: { code: 500 } };
  }

  const resolver = query.resolver;

  let whereClause: any = {};
  if (body.filter) {
    const filterKeys = Object.keys(body.filter);
    const orConditions: string[] = [];
    const andConditions: string[] = [];

    filterKeys.forEach(key => {
      // Check if this filter key needs to be mapped to multiple columns (like 'name' -> 'username', 'email')
      if (input?.map && input.map[key]) {
        const mapped = input.map[key];
        if (Array.isArray(mapped)) {
          orConditions.push(...mapped);
        } else {
          andConditions.push(mapped);
        }
      } else {
        // Direct column mapping
        andConditions.push(key);
      }
    });
    whereClause = {
      and: andConditions.length > 0 ? andConditions : undefined,
      or: orConditions.length > 0 ? orConditions : undefined
    };
  }
  // Map GraphQL body to fetchable Query format
  // Inside graphQL function...
  const mappedQuery = {
    ...resolver,
    engine: 'graphql', 
    select: body.select || resolver.columns.default,
    where: whereClause,
    limit: body.limit || resolver.pagination.limit.default,
    offset: body.offset || resolver.pagination.offset.default
  };

// Use body.filter as the primary data source for parameters
const result = await fetchDb(dbConf, mappedQuery, input, body.filter || body);

  // Dynamic Reshaping based on Redis JSON
  if (result.success && query.response?.shape) {
    const shape = query.response.shape;
    
    // We construct the response based on the 'shape' keys in your JSON
    const finalData = {
      success: shape.success ?? true,
      data: {
        items: result.data, // Maps to @result
        pagination: {
          totalRecords: (result.data as any[]).length, // Should ideally be a separate COUNT query
          pageSize: mappedQuery.limit,
          skipped: mappedQuery.offset
        },
        sortInfo: {
          key: body.sortBy || resolver.sorting.columns.default,
          direction: body.sortOrder || resolver.sorting.order.default
        }
      }
    };

    return { ...result, data: finalData };
  }

  return result;
}

export async function restApi(redis: any, body: BodyTypes): Promise<ResultType> {
  const { dbConf, query, input } = redis;
  const queryType = query?.type;
  switch (queryType) {
    case "FETCH":
      return fetchDb(dbConf, query, input, body);

    default:
      return { success: false, msg: `Query type ${queryType} not found`, error: { code: 400 } };
  }
}