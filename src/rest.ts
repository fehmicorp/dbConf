import { NextRequest } from "next/server";
import handlePost from "./pre.method/post";
import handleGet from "./pre.method/get";
import handlePut from "./pre.method/put";
import handleDelete from "./pre.method/delete";
import handlePatch from "./pre.method/patch";
import { Response } from "./post.method/response";

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