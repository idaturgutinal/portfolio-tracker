import { handlers } from "@/lib/auth";
import type { NextRequest } from "next/server";

const GET = handlers.GET as (req: NextRequest) => Promise<Response>;
const POST = handlers.POST as (req: NextRequest) => Promise<Response>;

export { GET, POST };
