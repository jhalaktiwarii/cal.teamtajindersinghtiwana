import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth";
import { getBirthdays, updateBirthday } from "@/lib/schema/birthdays";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const body = await req.json();
    const { ward } = body;

    if (!ward) {
      return new NextResponse(
        JSON.stringify({ error: "Ward is required" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get all existing birthdays
    const birthdays = await getBirthdays();
    
    // Filter birthdays that don't have a ward or have a different ward
    const birthdaysToUpdate = birthdays.filter(birthday => !birthday.ward || birthday.ward !== ward);
    
    if (birthdaysToUpdate.length === 0) {
      return NextResponse.json({ 
        message: "No birthdays need to be updated",
        updatedCount: 0,
        totalCount: birthdays.length
      });
    }

    // Update each birthday
    const updatePromises = birthdaysToUpdate.map(birthday => 
      updateBirthday(birthday.id, { ward })
    );
    
    await Promise.all(updatePromises);

    return NextResponse.json({ 
      message: `Successfully updated ${birthdaysToUpdate.length} birthdays to ward "${ward}"`,
      updatedCount: birthdaysToUpdate.length,
      totalCount: birthdays.length
    });

  } catch (error) {
    console.error('Bulk update ward error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to update birthdays", 
        details: error instanceof Error ? error.message : String(error) 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 