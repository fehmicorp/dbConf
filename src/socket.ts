import { Response } from "./post.method/response";
import { handleWS } from "./pre.method/ws";

export class WebSokcet {
  static async handle(
    req: any
  ) {
    switch (req.method) {
      case "WS":
        try {
            return await handleWS(req);
        } catch (err) {
          return Response.error("WebSocket Handshake Failed", 500);
        }
      default:
        return Response.error("Method Not Allowed", 405);
    }
  }
}