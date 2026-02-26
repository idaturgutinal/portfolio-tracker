import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId, unauthorizedResponse, badRequest, serverError } from "@/lib/api-utils";
import {
  getUserExportData,
  getUserAssetsFlat,
  getUserTransactionsFlat,
} from "@/services/user.service";

type ExportFormat = "csv-assets" | "csv-transactions" | "json";
const VALID_FORMATS: ExportFormat[] = ["csv-assets", "csv-transactions", "json"];

const dateStr = () => new Date().toISOString().split("T")[0];

function esc(v: string | number | boolean | null | undefined): string {
  return `"${String(v ?? "").replace(/"/g, '""')}"`;
}

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return unauthorizedResponse();

  try {
    const rawFormat = req.nextUrl.searchParams.get("format");
    const format = VALID_FORMATS.includes(rawFormat as ExportFormat)
      ? (rawFormat as ExportFormat)
      : null;

    if (!format) {
      return badRequest("Invalid format. Use csv-assets, csv-transactions, or json.");
    }

    if (format === "csv-assets") {
      const assets = await getUserAssetsFlat(userId);
      const headers = [
        "Portfolio",
        "Symbol",
        "Name",
        "Type",
        "Quantity",
        "Avg Buy Price",
        "Currency",
        "Notes",
        "Added",
      ];
      const rows = assets.map((a) =>
        [
          a.portfolioName,
          a.symbol,
          a.name,
          a.assetType,
          a.quantity,
          a.averageBuyPrice,
          a.currency,
          a.notes ?? "",
          a.createdAt.toISOString().split("T")[0],
        ].map(esc)
      );
      const csv = [headers.map(esc), ...rows].map((r) => r.join(",")).join("\n");
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="portfolio-assets-${dateStr()}.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    if (format === "csv-transactions") {
      const txs = await getUserTransactionsFlat(userId);
      const headers = [
        "Date",
        "Portfolio",
        "Symbol",
        "Name",
        "Type",
        "Quantity",
        "Price/Unit",
        "Fees",
        "Notes",
      ];
      const rows = txs.map((t) =>
        [
          t.date.toISOString().split("T")[0],
          t.asset.portfolio.name,
          t.asset.symbol,
          t.asset.name,
          t.type,
          t.quantity,
          t.pricePerUnit,
          t.fees,
          t.notes ?? "",
        ].map(esc)
      );
      const csv = [headers.map(esc), ...rows].map((r) => r.join(",")).join("\n");
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="portfolio-transactions-${dateStr()}.csv"`,
          "Cache-Control": "no-store",
        },
      });
    }

    // json
    const data = await getUserExportData(userId);
    const json = JSON.stringify(data, null, 2);
    return new NextResponse(json, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="portfolio-export-${dateStr()}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return serverError();
  }
}
