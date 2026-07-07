import type { CertificateRequest } from "@/types";

/**
 * Seed certificate requests (mock) for the logged-in student's demo. New
 * requests are appended and statuses advanced via the demo store.
 */
export const SEED_CERTIFICATE_REQUESTS: CertificateRequest[] = [
  {
    id: "cert-1001",
    type: "Bonafide",
    requestedOn: "2026-06-20T10:00:00+05:30",
    status: "Ready for Collection",
    copies: 2,
    purpose: "Passport application",
    delivery: "Collect at Counter",
  },
  {
    id: "cert-1002",
    type: "Transcript",
    requestedOn: "2026-07-01T15:30:00+05:30",
    status: "Under Review",
    copies: 1,
    purpose: "Higher-studies application (WES)",
    delivery: "Speed Post",
  },
];
