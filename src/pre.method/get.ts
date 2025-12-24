import { NextRequest, NextResponse } from "next/server";

export default async function handleGet(req: NextRequest) {
  return NextResponse.json({
    success: true,
    method: "GET",
  });
}