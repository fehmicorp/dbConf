import { NextResponse } from "next/server";

export async function redisData(req: any){
  const raw = req.headers.get("x-auth-data");
  if (!raw) {
    return NextResponse.json(
      { success: false, error: "Missing redis mapped data" },
      { status: 400 }
    );
  }  
  return JSON.parse(raw);
}