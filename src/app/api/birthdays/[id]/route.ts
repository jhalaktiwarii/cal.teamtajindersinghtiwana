import { NextResponse } from "next/server";
import { updateBirthday, deleteBirthday } from "@/lib/schema/birthdays";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  
  try {
    const { id } = await params;
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id } = await params;
    
    if (!id) {
      return new NextResponse("Birthday ID is required", { status: 400 });
    }

    await deleteBirthday(id);
    
    return new NextResponse("Birthday deleted successfully", { status: 200 });
  } catch (error) {
    console.error('DELETE /api/birthdays/[id] - Error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to delete birthday", 
        details: error instanceof Error ? error.message : String(error) 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 