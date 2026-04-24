import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";

import { auth } from "@/auth";
import { db } from "@/server/db";

export async function createTRPCContext() {
  const session = await auth();

  return {
    db,
    session,
    userId: session?.user?.id ?? null
  };
}

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson
});

const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be signed in to use this app."
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId
    }
  });
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
