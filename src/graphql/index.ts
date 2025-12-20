import { NextRequest, NextResponse } from "next/server";

export class GraphQL {
  static async handle(
    req: any
  ) {
    switch (req.method) {
      case "POST":
        return this.post(req);
      default:
        return NextResponse.json(
          { success: false, error: "Method Not Allowed" },
          { status: 405 }
        );
    }
  }
  static async post(req: NextRequest) {
    return NextResponse.json({
      success: true,
      method: "POST",
      result: await req.json(),
    });
  }
}