import handlePost from "./pre.method/post";
import { Response } from "./post.method/response";

export class GraphQL {
  static async handle(
    req: any
  ) {
    switch (req.method) {
      case "POST":
        return handlePost(req);
      default:
        return Response.error("Method Not Allowed", 405);
    }
  }
}