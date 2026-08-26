"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function login(_prevState: string | undefined, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const callbackUrl = formData.get("callbackUrl");

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: typeof callbackUrl === "string" && callbackUrl ? callbackUrl : "/panel/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Email o contraseña incorrectos.";
    }
    throw error;
  }
}
