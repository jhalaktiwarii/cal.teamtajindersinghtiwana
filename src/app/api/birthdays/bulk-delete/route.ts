import { NextResponse } from "next/server";
import { deleteBirthday } from "@/lib/schema/birthdays";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { ids } = await req.json();
    
    if (!ids || !Array.isArray(ids)) {
      return new NextResponse("IDs array is required", { status: 400 });
    }

    if (ids.length === 0) {
      return new NextResponse("No IDs provided", { status: 400 });
    }

    // Delete each birthday
    const results = await Promise.allSettled(
      ids.map(async (id: string) => {
        try {
          await deleteBirthday(id);
          return { id, success: true };
        } catch (error) {
          return { id, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
      })
    );

    const successful = results.filter(result => 
      result.status === 'fulfilled' && result.value.success
    ).length;
    
    const failed = results.filter(result => 
      result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)
    ).length;

    return NextResponse.json({
      message: `Bulk delete completed`,
      successful,
      failed,
      total: ids.length
    });
  } catch (error) {
    console.error('POST /api/birthdays/bulk-delete - Error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to bulk delete birthdays", 
        details: error instanceof Error ? error.message : String(error) 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
