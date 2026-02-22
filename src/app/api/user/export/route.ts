import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rawFormat = req.nextUrl.searchParams.get("format");
    const format = VALID_FORMATS.includes(rawFormat as ExportFormat)
      ? (rawFormat as ExportFormat)
      : null;

    if (!format) {
      return NextResponse.json(
        { error: "Invalid format. Use csv-assets, csv-transactions, or json." },
        { status: 400 }
      );
    }

    if (format === "csv-assets") {
      const assets = await getUserAssetsFlat(session.user.id);
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
      const txs = await getUserTransactionsFlat(session.user.id);
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
    const data = await getUserExportData(session.user.id);
    const json = JSON.stringify(data, null, 2);
    return new NextResponse(json, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="portfolio-export-${dateStr()}.json"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
