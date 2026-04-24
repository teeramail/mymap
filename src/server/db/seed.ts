import "dotenv/config";

import { eq } from "drizzle-orm";

import { ensureUser } from "@/server/auth/sync-user";
import { db } from "@/server/db";
import { samplePlaces } from "@/server/db/sample-places";
import { places } from "@/server/db/schema";
import { serverEnv } from "@/env-server";

async function main() {
  const owner = await ensureUser({
    email: serverEnv.VALID_EMAIL,
    name: serverEnv.VALID_EMAIL.split("@")[0] ?? "Owner"
  });

  const existingPlaces = await db.query.places.findMany({
    where: eq(places.userId, owner.id),
    columns: {
      name: true,
      city: true
    }
  });

  const existingKeys = new Set(existingPlaces.map((place) => `${place.name}::${place.city ?? ""}`));
  const placesToInsert = samplePlaces.filter(
    (place) => !existingKeys.has(`${place.name}::${place.city ?? ""}`)
  );

  if (placesToInsert.length === 0) {
    console.log("No new sample places to insert.");
    return;
  }

  await db.insert(places).values(
    placesToInsert.map((place) => ({
      userId: owner.id,
      name: place.name,
      description: place.description,
      city: place.city,
      country: place.country,
      category: place.category,
      latitude: place.latitude.toString(),
      longitude: place.longitude.toString()
    }))
  );

  console.log(`Inserted ${placesToInsert.length} sample places.`);
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
