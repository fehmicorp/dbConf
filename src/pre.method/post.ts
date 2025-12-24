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
  return { success: true, msg: "Hello GraphQL", data: body };
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