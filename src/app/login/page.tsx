import { LoginForm } from "./login-form";
import { CornerFrame } from "@/components/public/home/corner-frame";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4 font-[family-name:var(--font-barlow)]">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-6">
          <span className="flex items-center justify-center w-[27px] h-[27px] bg-accent font-[family-name:var(--font-barlow-condensed)] font-bold text-[17px] text-paper">
            C
          </span>
          <span className="font-[family-name:var(--font-barlow-condensed)] font-bold text-[19px] tracking-[0.16em] uppercase text-paper">
            Carbox
          </span>
        </div>
        <CornerFrame className="bg-paper p-8">
          <p className="text-[13px] text-neutral-500 mb-6">Panel interno — ingresa con tu cuenta</p>
          <LoginForm callbackUrl={callbackUrl ?? "/panel/dashboard"} />
        </CornerFrame>
      </div>
    </div>
  );
}
