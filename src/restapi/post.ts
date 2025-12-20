import { NextRequest } from "next/server";
import { redisData } from "../utils/header";
import { fetchDb } from "../db.actions/fetch.db";
import { Response } from "./response";

export default async function handlePost(req: NextRequest) {
  const { dbConf, query, input, security } = await redisData(req);
  const queryType = query?.type;
  let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }
  switch (queryType) {
    case "FETCH":
      return fetchDb(dbConf, query, input, body);
      break;

      default:
      return Response.error("Invalid Query Type", 400);
  }
}