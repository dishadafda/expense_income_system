"use client";

import React from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ExportButtonsProps {
  data: Record<string, any>[];
  filename: string;
}

export default function ExportButtons({ data, filename }: ExportButtonsProps) {
  const handleExcelExport = () => {
    if (data.length === 0) return alert("No data available to export.");
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const handlePdfExport = () => {
    if (data.length === 0) return alert("No data available to export.");
    const doc = new jsPDF("landscape");
    const keys = Object.keys(data[0]);
    const body = data.map((row) => keys.map((k) => row[k]?.toString() || ""));

    // Add a title
    doc.setFontSize(18);
    doc.text(filename.replace(/_/g, " "), 14, 15);

    // Generate table
    autoTable(doc, {
      startY: 20,
      head: [keys],
      body: body,
      theme: "grid",
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(`${filename}.pdf`);
  };

  return (
    <div className="d-flex gap-2">
      <button onClick={handleExcelExport} className="btn btn-sm btn-success d-flex align-items-center gap-1">
        <i className="bi bi-file-earmark-excel"></i> Export Excel
      </button>
      <button onClick={handlePdfExport} className="btn btn-sm btn-danger d-flex align-items-center gap-1">
        <i className="bi bi-file-earmark-pdf"></i> Export PDF
      </button>
    </div>
  );
}
