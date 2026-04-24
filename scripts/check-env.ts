import "dotenv/config";

import { Pool } from "pg";
import { HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";

type CheckResult = {
  name: string;
  ok: boolean;
  detail: string;
};

const results: CheckResult[] = [];

function record(name: string, ok: boolean, detail: string) {
  results.push({ name, ok, detail });
}

function requireVar(name: string): string | null {
  const value = process.env[name];
  if (!value) {
    record(name, false, "missing");
    return null;
  }
  record(name, true, "present");
  return value;
}

async function checkDatabase(url: string) {
  const pool = new Pool({ connectionString: url, max: 1 });
  try {
    const result = await pool.query("select 1 as ok");
    record("DATABASE_URL connectivity", true, `query returned ${result.rows[0]?.ok}`);
  } catch (error) {
    record("DATABASE_URL connectivity", false, (error as Error).message);
  } finally {
    await pool.end().catch(() => undefined);
  }
}

async function checkGoogleMaps(key: string) {
  const url = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=geometry&callback=initMap`;
  try {
    const response = await fetch(url);
    const body = await response.text();

    if (!response.ok) {
      record("Google Maps JavaScript API key", false, `HTTP ${response.status}`);
      return;
    }

    const lower = body.toLowerCase();
    if (lower.includes("invalidkey") || lower.includes("invalid key")) {
      record("Google Maps JavaScript API key", false, "Google reports the key is invalid.");
      return;
    }
    if (lower.includes("apinotactivatedmaperror")) {
      record(
        "Google Maps JavaScript API key",
        false,
        "Maps JavaScript API is not enabled on this project."
      );
      return;
    }
    if (lower.includes("billingnotenabledmaperror")) {
      record(
        "Google Maps JavaScript API key",
        false,
        "Billing is not enabled on this Google Cloud project."
      );
      return;
    }
    if (lower.includes("refererdeniedmaperror")) {
      record(
        "Google Maps JavaScript API key",
        false,
        "HTTP referrer restriction blocked this request. Add http://localhost:3000/* in the key restrictions."
      );
      return;
    }
    if (lower.includes("google.maps.load") || lower.includes("loaded=")) {
      record("Google Maps JavaScript API key", true, "JavaScript loader responded successfully.");
      return;
    }

    record(
      "Google Maps JavaScript API key",
      true,
      "Loader responded (unexpected body, but no known error markers)."
    );
  } catch (error) {
    record("Google Maps JavaScript API key", false, (error as Error).message);
  }
}

async function checkS3(params: {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  endpoint: string;
  bucket: string;
}) {
  const client = new S3Client({
    region: params.region,
    endpoint: params.endpoint,
    credentials: {
      accessKeyId: params.accessKeyId,
      secretAccessKey: params.secretAccessKey
    },
    forcePathStyle: false
  });

  try {
    await client.send(new HeadBucketCommand({ Bucket: params.bucket }));
    record("S3 / Spaces bucket access", true, `HeadBucket ok for ${params.bucket}`);
  } catch (error) {
    record("S3 / Spaces bucket access", false, (error as Error).message);
  }
}

async function main() {
  console.log("Checking environment variables...\n");

  const databaseUrl = requireVar("DATABASE_URL");
  requireVar("AUTH_SECRET");
  requireVar("VALID_EMAIL");
  requireVar("VALID_PASSWORD");
  requireVar("AUTH_GOOGLE_ID");
  requireVar("AUTH_GOOGLE_SECRET");
  const googleMapsKey = requireVar("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
  const awsKey = requireVar("AWS_ACCESS_KEY_ID");
  const awsSecret = requireVar("AWS_SECRET_ACCESS_KEY");
  const awsBucket = requireVar("AWS_S3_BUCKET");
  const awsRegion = requireVar("AWS_REGION");
  const awsEndpoint = requireVar("AWS_ENDPOINT");

  if (databaseUrl) {
    await checkDatabase(databaseUrl);
  }

  if (googleMapsKey) {
    await checkGoogleMaps(googleMapsKey);
  }

  if (awsKey && awsSecret && awsBucket && awsRegion && awsEndpoint) {
    await checkS3({
      accessKeyId: awsKey,
      secretAccessKey: awsSecret,
      region: awsRegion,
      endpoint: awsEndpoint,
      bucket: awsBucket
    });
  }

  let anyFailed = false;
  console.log("Results:");
  for (const result of results) {
    const status = result.ok ? "OK  " : "FAIL";
    console.log(`  [${status}] ${result.name}: ${result.detail}`);
    if (!result.ok) anyFailed = true;
  }

  console.log();
  if (anyFailed) {
    console.log("Some checks failed. See details above.");
    process.exit(1);
  } else {
    console.log("All checks passed.");
  }
}

void main();
