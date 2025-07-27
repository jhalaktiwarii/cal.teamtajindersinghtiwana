import { NextResponse } from "next/server";
import { updateBirthday, deleteBirthday } from "@/lib/schema/birthdays";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PATCH(req: Request, context: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id } = context.params;
  try {
    const updates = await req.json();
    const updated = await updateBirthday(id, updates);
    if (!updated) return new NextResponse("Not found", { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: "Failed to update birthday", details: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(req: Request, context: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id } = context.params;
  try {
    await deleteBirthday(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ error: "Failed to delete birthday", details: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 