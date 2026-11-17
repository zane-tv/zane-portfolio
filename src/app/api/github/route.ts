import { NextResponse } from "next/server";
import { getGitHubTelemetry } from "@/lib/github";

/**
 * Server-side cached GitHub telemetry route.
 * Never exposes server GITHUB_TOKEN to the client.
 */
export async function GET() {
  const data = await getGitHubTelemetry();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
    },
  });
}
