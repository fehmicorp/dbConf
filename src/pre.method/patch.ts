import { NextRequest, NextResponse } from "next/server";

export default async function handlePatch(req: NextRequest) {
  return NextResponse.json({
    success: true,
    method: "PATCH",
    result: await req.json(),
  });
}