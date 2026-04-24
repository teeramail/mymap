import { and, desc, eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { uploadPlaceImage } from "@/lib/upload";
import { isObjectStorageEnabled } from "@/env-server";
import { placeImages, places } from "@/server/db/schema";

const uploadInputSchema = z.object({
  placeId: z.string().uuid(),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  fileBase64: z.string().min(1)
});

export const placeImageRouter = createTRPCRouter({
  upload: protectedProcedure.input(uploadInputSchema).mutation(async ({ ctx, input }) => {
    if (!isObjectStorageEnabled) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "Object storage is not configured."
      });
    }

    const place = await ctx.db.query.places.findFirst({
      where: and(eq(places.id, input.placeId), eq(places.userId, ctx.userId))
    });

    if (!place) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "The selected place was not found."
      });
    }

    const { imageUrl, key } = await uploadPlaceImage({
      userId: ctx.userId,
      fileName: input.fileName,
      mimeType: input.mimeType,
      fileBuffer: Buffer.from(input.fileBase64, "base64")
    });

    await ctx.db
      .update(placeImages)
      .set({
        isPrimary: false
      })
      .where(and(eq(placeImages.placeId, input.placeId), eq(placeImages.userId, ctx.userId)));

    const [createdImage] = await ctx.db
      .insert(placeImages)
      .values({
        placeId: input.placeId,
        userId: ctx.userId,
        storageKey: key,
        imageUrl,
        altText: place.name,
        isPrimary: true
      })
      .returning();

    return createdImage;
  }),
  latestForPlace: protectedProcedure
    .input(z.object({ placeId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const image = await ctx.db.query.placeImages.findFirst({
        where: and(eq(placeImages.placeId, input.placeId), eq(placeImages.userId, ctx.userId)),
        orderBy: [desc(placeImages.createdAt)]
      });

      return image ?? null;
    })
});
