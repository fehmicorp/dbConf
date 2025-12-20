import { NextRequest } from "next/server";
import handlePost from "./post";
import handleGet from "./get";
import handlePut from "./put";
import handleDelete from "./delete";
import handlePatch from "./patch";
import { Response } from "./response";
import { redisData } from "../utils/header";

export class Rest {
  static async handle(
    req: NextRequest,
  ) {
    switch (req.method) {
      case "GET":
        return handleGet(req);
      case "POST":
        return handlePost(req);
      case "PUT":
        return handlePut(req);
      case "DELETE":
        return handleDelete(req);
      case "PATCH":
        return handlePatch(req);
      default:
        return Response.error("Method Not Allowed", 405);
    }
  }
}