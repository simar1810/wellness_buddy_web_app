import { isAfter, isBefore, parse } from "date-fns";
import * as XLSX from "xlsx";

export function excelRetailOrdersData(orders, dates) {
  const startDate = parse(dates.startDate, 'yyyy-MM-dd', new Date());
  const endDate = parse(dates.endDate, 'yyyy-MM-dd', new Date());

  const exporting = (orders.myOrder || [])
    .filter(order => {
      const parsedDate = parse(order.createdAt, "dd-MM-yyyy", new Date())
      return isAfter(parsedDate, startDate) && isBefore(parsedDate, endDate)
    })
    .map(order => ({
      "Client Name": order?.clientId?.name || "",
      "Phone Number": order?.clientId?.mobileNumber || "",
      "Date": order.createdAt,
      "Coach Margin": order?.coachMargin || 0,
      "Cost Price": order?.costPrice || 0,
      "Customer Margin": order?.customerMargin || 0,
      "Invoice Number": order?.invoiceNumber || 0,
      "Selling Price": order?.sellingPrice || 0,
      "Status": order?.status || 0,
      "Paid Amount": order?.paidAmount || 0,
      "Pending Amount": Number(order?.sellingPrice || 0) - Math.max(Number(order?.paidAmount || 0), 0),
      "Profit": Math.max(Number(order?.paidAmount || 0) - (Number(order?.costPrice || 0)), 0)
    }))

  return exporting;
}

export function exportToExcel(
  data,
  sheetName = "Sheet1",
  fileName = "data.xlsx",
  columnWidths = []
) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error("No data provided for Excel export. No records to export.");
  }

  const worksheet = XLSX.utils.json_to_sheet(data);

  const numberOfColumns = Object.keys(data[0]).length;

  worksheet["!cols"] = Array.from({ length: numberOfColumns }, (_, i) => {
    return columnWidths[i] ? columnWidths[i] : { wch: 14 }; // 14 ≈ 100px
  });

  Object.keys(worksheet).forEach((cell) => {
    if (cell[0] !== "!") {
      worksheet[cell].s = { alignment: { wrapText: true, vertical: "top" } };
    }
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, fileName);
}

