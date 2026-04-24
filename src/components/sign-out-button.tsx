"use client";

import { useTransition } from "react";

import { signOutAction } from "@/app/dashboard/actions";

export function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(() => {
          void signOutAction();
        });
      }}
      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
    >
      {isPending ? "Signing out..." : "Sign out"}
    </button>
  );
}
