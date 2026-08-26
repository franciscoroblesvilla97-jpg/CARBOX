import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Rol } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nombre: string;
      email: string;
      rol: Rol;
    };
  }
}

type AppToken = {
  id: string;
  nombre: string;
  rol: Rol;
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const usuario = await prisma.usuario.findUnique({ where: { email } });
        if (!usuario || !usuario.activo) return null;

        const valido = await bcrypt.compare(password, usuario.passwordHash);
        if (!valido) return null;

        return {
          id: usuario.id,
          name: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      const t = token as typeof token & Partial<AppToken>;
      if (user) {
        t.id = user.id as string;
        t.nombre = user.name as string;
        t.rol = (user as { rol: Rol }).rol;
      }
      return t;
    },
    session: async ({ session, token }) => {
      const t = token as typeof token & AppToken;
      session.user.id = t.id;
      session.user.nombre = t.nombre;
      session.user.rol = t.rol;
      return session;
    },
  },
});
