import { NextResponse } from "next/server";
import { getBirthdays, createBirthday } from "@/lib/schema/birthdays";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/auth";

export async function GET() {
  try {
    const birthdays = await getBirthdays();
    return NextResponse.json(birthdays);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch birthdays", details: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    const body = await req.json();
    const newBirthday = await createBirthday(body);
    return NextResponse.json(newBirthday);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: "Failed to create birthday", details: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 