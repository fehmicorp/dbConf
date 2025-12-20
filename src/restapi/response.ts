import { NextResponse } from "next/server";

export class Response{
  static success(data: any, status: number = 200) {
    return NextResponse.json(
      { success: true, data },
      { status }
    );
  }
  static error(error: string, status: number = 500) {
    return NextResponse.json(
      { success: false, error },
      { status }
    );
  }
  static redirect(url: string, status: number = 302) {
    return NextResponse.redirect(url, { status });
  }
  static custom(body: any, status: number = 200, headers: HeadersInit = {}) {
    return new NextResponse(body, { status, headers });
  }
}