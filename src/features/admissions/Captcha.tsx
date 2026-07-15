"use client";

import { RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/Field";

interface Props {
  code: string;
  value: string;
  onChange: (v: string) => void;
  onRegenerate: () => void;
  error?: string;
}

/** Cosmetic 6-digit captcha (client-only; no real bot protection). */
export function Captcha({ code, value, onChange, onRegenerate, error }: Props) {
  return (
    <div>
      <div className="flex items-end gap-3">
        <span className="rounded-btn border-line bg-cream-deep text-navy select-none border px-4 py-2 font-mono text-lg font-bold tracking-[0.35em] [text-decoration:line-through] [text-decoration-color:rgba(16,35,60,0.25)]">
          {code}
        </span>
        <button
          type="button"
          onClick={onRegenerate}
          aria-label="Regenerate captcha"
          className="text-muted hover:text-navy border-line hover:border-navy rounded-btn border p-2 transition-colors"
        >
          <RefreshCw className="size-4" />
        </button>
        <div className="flex-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={6}
            inputMode="numeric"
            placeholder="Enter the 6 digits"
          />
        </div>
      </div>
      {error && <p className="text-danger mt-1 text-xs">{error}</p>}
    </div>
  );
}
