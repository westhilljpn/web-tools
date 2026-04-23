import { NextResponse } from "next/server";

const PAYLOAD_SIZE = 512 * 1024; // 512 KB

export function GET() {
  const bytes = new Uint8Array(PAYLOAD_SIZE);
  crypto.getRandomValues(bytes);
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "no-store",
    },
  });
}
