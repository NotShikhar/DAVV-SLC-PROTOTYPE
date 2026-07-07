import type { PaymentMethod } from "@/types";

/**
 * Mock in-house payment service. This is the single seam to swap for a real
 * gateway (Razorpay / PayU / an in-house PG) later — call sites (the fee
 * payment modal) won't change, only this function's body.
 */

export interface PaymentRequest {
  enrollmentNo: string;
  feeIds: string[];
  amount: number;
  method: PaymentMethod;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  receiptNo: string;
  paidOn: string; // ISO
}

export async function initiatePayment(req: PaymentRequest): Promise<PaymentResult> {
  // Simulate gateway round-trip latency.
  await new Promise((resolve) => setTimeout(resolve, 700));
  const stamp = Date.now();
  return {
    success: true,
    transactionId: `TXN${stamp}`,
    receiptNo: `IET/FEE/${new Date().getFullYear()}/${String(stamp).slice(-6)}`,
    paidOn: new Date().toISOString(),
    // `req` carries what a real gateway would charge against.
    ...(req.amount < 0 ? { success: false } : {}),
  };
}
