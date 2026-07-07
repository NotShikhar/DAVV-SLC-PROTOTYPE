import { jsPDF } from "jspdf";
import type { CertificateType, Student } from "@/types";
import { INSTITUTE } from "@/lib/domain/constants";
import { formatDate, toRoman } from "@/lib/utils/format";

const NAVY: [number, number, number] = [26, 58, 92];
const GOLD: [number, number, number] = [196, 145, 93];
const SLATE: [number, number, number] = [74, 85, 104];

function header(doc: jsPDF, subtitle: string) {
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, 210, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(INSTITUTE.shortName, 15, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`${INSTITUTE.name}, ${INSTITUTE.university}`, 15, 20);
  doc.setTextColor(...GOLD);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text(subtitle, 15, 26.5);
}

function line(doc: jsPDF, y: number) {
  doc.setDrawColor(226, 232, 240);
  doc.line(15, y, 195, y);
}

function labelValue(doc: jsPDF, label: string, value: string, x: number, y: number) {
  doc.setTextColor(...SLATE);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(label.toUpperCase(), x, y);
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(value, x, y + 5);
}

/** Generate and download a mock examination hall ticket. */
export function generateHallTicket(
  student: Student,
  reg: { hallTicketNo: string; semester: number; courses: { code: string; title: string }[] },
): void {
  const doc = new jsPDF();
  header(doc, "Examination Hall Ticket");

  labelValue(doc, "Name", student.name, 15, 42);
  labelValue(doc, "Enrollment No.", student.enrollmentNo, 110, 42);
  labelValue(doc, "Branch / Section", `${student.branch} · ${student.section}`, 15, 56);
  labelValue(doc, "Semester", `${toRoman(reg.semester)} (Odd)`, 110, 56);
  labelValue(doc, "Hall Ticket No.", reg.hallTicketNo, 15, 70);
  labelValue(doc, "Examination Centre", "IET DAVV, Takshashila Campus", 110, 70);

  line(doc, 80);
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Registered Courses", 15, 89);

  doc.setFontSize(9);
  doc.setFillColor(245, 243, 240);
  doc.rect(15, 93, 180, 8, "F");
  doc.text("Code", 18, 98.5);
  doc.text("Course", 45, 98.5);

  let y = 108;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE);
  reg.courses.forEach((c) => {
    doc.text(c.code, 18, y);
    doc.text(c.title, 45, y);
    y += 8;
  });

  line(doc, y + 2);
  doc.setFontSize(8);
  doc.setTextColor(...SLATE);
  doc.text(
    "Attendance of at least 75% and cleared internal assessment are required to appear. Carry a valid ID card.",
    15,
    y + 9,
    { maxWidth: 180 },
  );
  doc.text(`Issued on ${formatDate(new Date().toISOString())} · Prototype document (mock)`, 15, 285);

  doc.save(`HallTicket-${student.enrollmentNo}.pdf`);
}

/** Generate and download a mock certificate document. */
export function generateCertificate(
  student: Student,
  type: CertificateType,
  meta: { id: string; purpose: string; copies: number },
): void {
  const doc = new jsPDF();
  header(doc, `${type} Certificate`);

  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(`${type} Certificate`, 105, 55, { align: "center" });

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.6);
  doc.line(70, 60, 140, 60);
  doc.setLineWidth(0.2);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE);
  doc.setFontSize(11);
  const body =
    `This is to certify that ${student.name} (Enrollment No. ${student.enrollmentNo}), ` +
    `a bona fide student of ${INSTITUTE.degree} ${student.branch}, Semester ${toRoman(student.currentSemester)}, ` +
    `at the ${INSTITUTE.name}, ${INSTITUTE.university}, Indore, is issued this ${type} certificate ` +
    `for the purpose of "${meta.purpose}".`;
  doc.text(body, 20, 78, { maxWidth: 170, lineHeightFactor: 1.6 });

  labelValue(doc, "Reference No.", meta.id.toUpperCase(), 20, 120);
  labelValue(doc, "Copies", String(meta.copies), 110, 120);
  labelValue(doc, "Date of Issue", formatDate(new Date().toISOString()), 20, 134);

  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.text("Registrar", 160, 160);
  doc.setDrawColor(...SLATE);
  doc.line(150, 155, 190, 155);

  doc.setFontSize(8);
  doc.setTextColor(...SLATE);
  doc.text(
    "This is a prototype document generated for demonstration. Not a legally valid certificate.",
    20,
    285,
  );

  doc.save(`${type}-${student.enrollmentNo}.pdf`);
}

/** Generate and download a fee-payment receipt. */
export function generateFeeReceipt(
  student: Student,
  receipt: {
    receiptNo: string;
    transactionId: string;
    method: string;
    paidOn: string;
    items: { head: string; semester: number; amount: number }[];
    total: number;
  },
): void {
  const doc = new jsPDF();
  header(doc, "Fee Payment Receipt");

  labelValue(doc, "Name", student.name, 15, 42);
  labelValue(doc, "Enrollment No.", student.enrollmentNo, 110, 42);
  labelValue(doc, "Receipt No.", receipt.receiptNo, 15, 56);
  labelValue(doc, "Transaction ID", receipt.transactionId, 110, 56);
  labelValue(doc, "Payment Mode", receipt.method, 15, 70);
  labelValue(doc, "Paid On", formatDate(receipt.paidOn), 110, 70);

  line(doc, 80);
  doc.setFillColor(245, 243, 240);
  doc.rect(15, 84, 180, 8, "F");
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Particulars", 18, 89.5);
  doc.text("Amount (INR)", 160, 89.5);

  let y = 100;
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE);
  receipt.items.forEach((it) => {
    doc.text(`${it.head} — Semester ${toRoman(it.semester)}`, 18, y);
    doc.text(String(it.amount.toLocaleString("en-IN")), 160, y);
    y += 8;
  });

  line(doc, y + 1);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.setFontSize(11);
  doc.text("Total Paid", 18, y + 9);
  doc.text(`INR ${receipt.total.toLocaleString("en-IN")}`, 150, y + 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...SLATE);
  doc.text("Computer-generated receipt · prototype document (mock payment).", 15, 285);

  doc.save(`FeeReceipt-${receipt.receiptNo.replace(/[^A-Za-z0-9]/g, "-")}.pdf`);
}
