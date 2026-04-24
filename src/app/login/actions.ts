"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";

export async function signInWithCredentials(_previousState: string | undefined, formData: FormData) {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/dashboard"
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Your email or password is invalid.";
        default:
          return "Unable to sign in right now.";
      }
    }

    throw error;
  }
}
