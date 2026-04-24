import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().min(1),
  NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID: z.string().optional()
});

const parsed = clientSchema.safeParse({
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID
});

if (!parsed.success) {
  throw new Error(`Invalid public environment variables: ${parsed.error.message}`);
}

export const clientEnv = parsed.data;
