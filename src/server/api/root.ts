import { createTRPCRouter } from "@/server/api/trpc";
import { placeImageRouter } from "@/server/api/routers/place-image";
import { placeRouter } from "@/server/api/routers/place";

export const appRouter = createTRPCRouter({
  place: placeRouter,
  placeImage: placeImageRouter
});

export type AppRouter = typeof appRouter;
