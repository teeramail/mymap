import { eq } from "drizzle-orm";

import { db } from "@/server/db";
import { users } from "@/server/db/schema";

export async function ensureUser(params: {
  email: string;
  name: string;
  image?: string | null;
}) {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, params.email)
  });

  if (existingUser) {
    const [updatedUser] = await db
      .update(users)
      .set({
        name: params.name,
        image: params.image ?? existingUser.image,
        isActive: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, existingUser.id))
      .returning();

    return updatedUser;
  }

  const [createdUser] = await db
    .insert(users)
    .values({
      email: params.email,
      name: params.name,
      image: params.image ?? null,
      role: "owner",
      isActive: true
    })
    .returning();

  return createdUser;
}
