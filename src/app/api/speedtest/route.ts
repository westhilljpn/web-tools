import { NextResponse } from "next/server";

const PAYLOAD_SIZE = 512 * 1024; // 512 KB

export function GET(_request: Request) {
  const bytes = new Uint8Array(PAYLOAD_SIZE); // zero-filled — randomness not needed for speed test
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "no-store",
      "Content-Length": String(PAYLOAD_SIZE),
    },
  });
}
