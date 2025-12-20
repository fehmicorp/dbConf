import { NextRequest, NextResponse } from "next/server";

export default async function handlePut(req: NextRequest) {
  return NextResponse.json({
    success: true,
    method: "PUT",
    result: await req.json(),
  });
}