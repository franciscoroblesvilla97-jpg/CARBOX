import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-lg shadow p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Carbox</h1>
        <p className="text-sm text-slate-500 mb-6">Panel interno — ingresa con tu cuenta</p>
        <LoginForm callbackUrl={callbackUrl ?? "/panel/dashboard"} />
      </div>
    </div>
  );
}
