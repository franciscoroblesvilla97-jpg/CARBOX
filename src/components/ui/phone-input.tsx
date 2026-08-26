"use client";

import { useState } from "react";

function extraerDigitos(valor: string) {
  const soloDigitos = valor.replace(/\D/g, "");
  return soloDigitos.startsWith("569") ? soloDigitos.slice(3, 11) : soloDigitos.slice(-8);
}

export function PhoneInput({
  name,
  defaultValue = "",
  required = false,
}: {
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const [digitos, setDigitos] = useState(() => (defaultValue ? extraerDigitos(defaultValue) : ""));

  return (
    <div>
      <div className="flex">
        <span className="inline-flex items-center rounded-l-md border border-r-0 border-slate-300 bg-slate-50 px-3 text-sm text-slate-500">
          +569
        </span>
        <input
          type="tel"
          inputMode="numeric"
          maxLength={8}
          placeholder="12345678"
          value={digitos}
          onChange={(e) => setDigitos(e.target.value.replace(/\D/g, "").slice(0, 8))}
          required={required}
          className="w-full rounded-r-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>
      <input type="hidden" name={name} value={digitos ? `+569${digitos}` : ""} />
    </div>
  );
}
