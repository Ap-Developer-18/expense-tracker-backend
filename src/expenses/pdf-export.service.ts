import { Injectable } from "@nestjs/common";
import PDFDocument = require("pdfkit");
import { PassThrough } from "stream";

const CATEGORY_LABELS: Record<string, string> = {
  MISCELLANEOUS: "Futkar Kharch",
  TRAVEL: "Yatra Kharch",
  PURCHASE: "Futkar Khareed",
  GST_INVOICE: "Gst Invoice",
  STAFF_PAYMENT: "Payment to Staff",
  TRANSFER: "Transfer to Staff",
  RETURN_TO_FIRM: "Returns to Firm",
};

const MODE_LABELS: Record<string, string> = {
  CASH: "Cash",
  UPI: "UPI",
  BANK_TRANSFER: "Bank Transfer",
  CHEQUE: "Cheque",
  OTHER: "Other",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  PARTIALLY_APPROVED: "Partially Approved",
  REJECTED: "Rejected",
};

@Injectable()
export class PdfExportService {
  /**
   * Builds a PDF statement for a set of expenses and returns it as a Buffer.
   */
  async generateStatement(params: {
    projectName: string;
    expenses: any[];
    filters: { startDate?: string; endDate?: string; categories?: string[] };
  }): Promise<Buffer> {
    const { projectName, expenses, filters } = params;

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const stream = new PassThrough();
    doc.pipe(stream);

    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));

    doc.fontSize(18).font("Helvetica-Bold").text("Expense Statement", {
      align: "center",
    });
    doc.moveDown(0.3);
    doc.fontSize(12).font("Helvetica").text(projectName, { align: "center" });
    doc.moveDown(0.5);

    const rangeText = [
      filters.startDate ? `From: ${filters.startDate}` : null,
      filters.endDate ? `To: ${filters.endDate}` : null,
      filters.categories?.length
        ? `Categories: ${filters.categories
            .map((c) => CATEGORY_LABELS[c] ?? c)
            .join(", ")}`
        : null,
    ]
      .filter(Boolean)
      .join("   |   ");

    if (rangeText) {
      doc.fontSize(9).fillColor("#666").text(rangeText, { align: "center" });
      doc.fillColor("#000");
    }
    doc.moveDown(1);

    const totalSubmitted = expenses.reduce((s, e) => s + e.submittedAmount, 0);
    const totalApproved = expenses.reduce(
      (s, e) => s + (e.approvedAmount ?? 0),
      0,
    );
    const totalReimbursed = expenses.reduce(
      (s, e) => s + (e.reimbursedAmount ?? 0),
      0,
    );

    doc.fontSize(10).font("Helvetica-Bold");
    doc.text(
      `Submitted: Rs.${totalSubmitted}    Approved: Rs.${totalApproved}    Reimbursed: Rs.${totalReimbursed}    Receivable: Rs.${
        totalApproved - totalReimbursed
      }`,
      { align: "left" },
    );
    doc.moveDown(1);

    const startX = 40;
    let y = doc.y;
    const colWidths = [60, 75, 65, 70, 60, 70, 60, 65];
    const headers = [
      "Date",
      "Field Mgr",
      "Mode",
      "Category",
      "Submitted",
      "Approved",
      "Reimb.",
      "Status",
    ];

    const drawRow = (cells: string[], bold = false) => {
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(8);
      let x = startX;
      cells.forEach((cell, i) => {
        doc.text(cell, x, y, { width: colWidths[i], ellipsis: true });
        x += colWidths[i];
      });
      y += 18;
      if (y > 760) {
        doc.addPage();
        y = 40;
      }
    };

    drawRow(headers, true);
    doc
      .moveTo(startX, y - 4)
      .lineTo(startX + colWidths.reduce((a, b) => a + b, 0), y - 4)
      .strokeColor("#ccc")
      .stroke();

    for (const e of expenses) {
      drawRow([
        new Date(e.expenseDate).toLocaleDateString("en-IN"),
        e.fieldManager?.fullName ?? "-",
        MODE_LABELS[e.mode] ?? e.mode,
        CATEGORY_LABELS[e.paidFor] ?? e.paidFor,
        `Rs.${e.submittedAmount}`,
        e.approvedAmount != null ? `Rs.${e.approvedAmount}` : "-",
        `Rs.${e.reimbursedAmount ?? 0}`,
        STATUS_LABELS[e.status] ?? e.status,
      ]);
    }

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on("end", () => resolve(Buffer.concat(chunks)));
      stream.on("error", reject);
    });
  }

  /**
   * Builds a single-page "bill" PDF for one expense — a formal receipt
   * showing every detail of that specific expense. Used by the download
   * icon on each expense card.
   */
  async generateExpenseBill(expense: any): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const stream = new PassThrough();
    doc.pipe(stream);

    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));

    // Header
    doc.fontSize(20).font("Helvetica-Bold").text("Expense Bill", {
      align: "center",
    });
    doc.moveDown(0.3);
    doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("#666")
      .text(expense.project?.name ?? "-", { align: "center" });
    doc.fillColor("#000");
    doc.moveDown(1.5);

    // Status badge line
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor(
        expense.status === "APPROVED"
          ? "#16a34a"
          : expense.status === "REJECTED"
            ? "#dc2626"
            : expense.status === "PARTIALLY_APPROVED"
              ? "#d97706"
              : "#666",
      )
      .text(STATUS_LABELS[expense.status] ?? expense.status, {
        align: "right",
      });
    doc.fillColor("#000");
    doc.moveDown(0.5);

    const row = (label: string, value: string) => {
      const y = doc.y;
      doc.fontSize(10).font("Helvetica").fillColor("#666").text(label, 50, y, {
        width: 180,
      });
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor("#000")
        .text(value, 230, y, { width: 300 });
      doc.moveDown(0.9);
    };

    row("Bill No.", expense.id.slice(0, 8).toUpperCase());
    row(
      "Date",
      new Date(expense.expenseDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    );
    row("Field Manager", expense.fieldManager?.fullName ?? "-");
    row("Paid To", expense.receiver ?? "-");
    row("Payment Mode", MODE_LABELS[expense.mode] ?? expense.mode);
    row("Category", CATEGORY_LABELS[expense.paidFor] ?? expense.paidFor);

    if (expense.paidFor === "TRANSFER") {
      row("Transferred To", expense.transferToFieldManager?.fullName ?? "-");
      row("Transfer Status", expense.transferStatus ?? "-");
    }

    if (expense.description) {
      row("Details", expense.description);
    }

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#ccc").stroke();
    doc.moveDown(1);

    // Amount summary box
    doc.fontSize(10).font("Helvetica").fillColor("#666");
    doc.text("Submitted Amount", 50, doc.y);
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .fillColor("#000")
      .text(`Rs.${expense.submittedAmount}`, 50, doc.y + 2);
    doc.moveDown(1.2);

    if (expense.approvedAmount != null) {
      const y2 = doc.y;
      doc.fontSize(10).font("Helvetica").fillColor("#666");
      doc.text("Approved", 50, y2, { width: 150 });
      doc.text("Reimbursed", 220, y2, { width: 150 });
      doc.text("Receivable", 390, y2, { width: 150 });

      doc.fontSize(13).font("Helvetica-Bold").fillColor("#000");
      doc.text(`Rs.${expense.approvedAmount}`, 50, y2 + 16, { width: 150 });
      doc.text(`Rs.${expense.reimbursedAmount ?? 0}`, 220, y2 + 16, {
        width: 150,
      });
      doc
        .fillColor("#16a34a")
        .text(
          `Rs.${expense.approvedAmount - (expense.reimbursedAmount ?? 0)}`,
          390,
          y2 + 16,
          { width: 150 },
        );
      doc.fillColor("#000");
      doc.moveDown(2.5);
    }

    if (expense.reviewedByAccountManager) {
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor("#666")
        .text(
          `Reviewed by ${expense.reviewedByAccountManager.fullName}`,
          50,
          doc.y,
        );
      doc.fillColor("#000");
    }

    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor("#999")
      .text(`Generated on ${new Date().toLocaleDateString("en-IN")}`, 50, 750, {
        align: "center",
        width: 495,
      });

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on("end", () => resolve(Buffer.concat(chunks)));
      stream.on("error", reject);
    });
  }
}
