"use client";

import { useActionState } from "react";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [error, formAction, pending] = useActionState(login, undefined);

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <Field label="Email">
        <Input type="email" name="email" required autoFocus />
      </Field>
      <Field label="Contraseña">
        <Input type="password" name="password" required />
      </Field>
      {error && <p className="text-sm text-[#a63327]">{error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Ingresando..." : "Ingresar"}
      </Button>
    </form>
  );
}
