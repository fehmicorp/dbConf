import { NextRequest, NextResponse } from "next/server";

export default async function handleDelete(req: NextRequest) {
  return NextResponse.json({
    success: true,
    method: "DELETE",
  });
}