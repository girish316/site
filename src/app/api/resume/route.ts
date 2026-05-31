import { NextResponse } from "next/server";

// Reads these from environment variables (set in .env.local and Vercel)
const GITHUB_TOKEN   = process.env.GITHUB_TOKEN!;
const GITHUB_OWNER   = process.env.GITHUB_RESUME_OWNER!;   // e.g. "girishm"
const GITHUB_REPO    = process.env.GITHUB_RESUME_REPO!;    // e.g. "my-resume"
const GITHUB_BRANCH  = process.env.GITHUB_RESUME_BRANCH ?? "main";
const GITHUB_PATH    = process.env.GITHUB_RESUME_PATH ?? "resume.pdf";

export async function GET() {
  // Validate env is configured
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return new NextResponse(
      JSON.stringify({ error: "GitHub resume not configured. Set GITHUB_TOKEN, GITHUB_RESUME_OWNER, GITHUB_RESUME_REPO in .env.local" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Use the raw content endpoint — works for files up to 100MB
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${GITHUB_PATH}`;

    const res = await fetch(rawUrl, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3.raw",
      },
      // Don't cache — always serve latest committed version
      cache: "no-store",
    });

    if (!res.ok) {
      const msg = res.status === 404
        ? `File not found: ${GITHUB_PATH} on branch ${GITHUB_BRANCH} in ${GITHUB_OWNER}/${GITHUB_REPO}`
        : res.status === 401
        ? "GitHub token is invalid or expired"
        : `GitHub returned ${res.status}`;
      return new NextResponse(JSON.stringify({ error: msg }), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const pdfBuffer = await res.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `inline; filename="resume.pdf"`,
        "Cache-Control":       "no-cache, no-store, must-revalidate",
        "Content-Length":      String(pdfBuffer.byteLength),
      },
    });
  } catch (e: any) {
    return new NextResponse(
      JSON.stringify({ error: e?.message ?? "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
