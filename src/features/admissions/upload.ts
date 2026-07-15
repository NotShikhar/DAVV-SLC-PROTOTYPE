import type { UploadMeta } from "@/types";

/** Max upload size for photos/proofs (mocked — we only keep metadata + preview). */
export const MAX_UPLOAD_KB = 500;

let uploadSeq = 0;

/** Read a picked File into UploadMeta (name/size/type + a transient base64 preview). */
export function fileToUploadMeta(file: File): Promise<UploadMeta> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        name: file.name,
        sizeKB: Math.max(1, Math.round(file.size / 1024)),
        type: file.type,
        dataUrl: String(reader.result ?? ""),
      });
    reader.readAsDataURL(file);
  });
}

/** A fresh, empty payment transaction row. */
export function makeEmptyPaymentRow() {
  return {
    id: `pay-${Date.now()}-${uploadSeq++}`,
    txnNo: "",
    amount: 0,
    payDate: "",
    bankMode: "",
    remarks: "",
  };
}
