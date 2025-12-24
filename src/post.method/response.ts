import { NextResponse } from "next/server";
import { ResultDataTypes } from "../utils/data.type";

export class Response{
  static res(success: boolean, msg: string | null, data: ResultDataTypes | null, status: number = 200) {
    const body = {
      success,
      ...(msg && { msg }),
      ...(data != null && { data })
    };
    return NextResponse.json(body, { status });
  }
  static error(error: any, status: number = 500) {
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