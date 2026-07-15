"use client";

import { Upload } from "lucide-react";
import type { UploadMeta } from "@/types";
import { cn } from "@/lib/utils/cn";
import { buttonClasses } from "@/components/ui/Button";
import { fileToUploadMeta, MAX_UPLOAD_KB } from "./upload";

interface Props {
  value?: UploadMeta;
  onChange: (meta: UploadMeta | undefined) => void;
  error?: string;
}

/** Passport-photo uploader (mocked — keeps metadata + an in-memory preview). */
export function PhotoUpload({ value, onChange, error }: Props) {
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onChange(await fileToUploadMeta(file));
  };
  const tooBig = value ? value.sizeKB > MAX_UPLOAD_KB : false;

  return (
    <div className="flex items-start gap-4">
      <div className="border-line bg-cream grid size-24 shrink-0 place-items-center overflow-hidden rounded-lg border">
        {value?.dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- transient base64 preview, no static asset
          <img src={value.dataUrl} alt="" className="size-full object-cover" />
        ) : (
          <span className="text-muted text-[10px]">No photo</span>
        )}
      </div>
      <div className="space-y-1.5">
        <label className={cn(buttonClasses("secondary", "sm"), "cursor-pointer")}>
          <Upload className="size-4" /> {value ? "Replace" : "Upload"} photo
          <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={onFile} />
        </label>
        {value && (
          <p className="text-muted text-xs">
            {value.name} · {value.sizeKB} KB
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="text-danger ml-2 hover:underline"
            >
              Remove
            </button>
          </p>
        )}
        <p className={cn("text-xs", tooBig || error ? "text-danger" : "text-muted")}>
          {tooBig ? "File exceeds 500 KB" : (error ?? "JPG / PNG · max 500 KB")}
        </p>
      </div>
    </div>
  );
}
