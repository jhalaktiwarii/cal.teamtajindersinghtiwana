import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth";
import { getBirthdays, deleteBirthday } from "@/lib/schema/birthdays";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Get all birthdays
    const birthdays = await getBirthdays();
    
    // Find invalid birthdays
    const invalidBirthdays = birthdays.filter(bday => 
      !bday || 
      !bday.fullName || 
      typeof bday.day !== 'number' || 
      typeof bday.month !== 'number' ||
      bday.day < 1 || bday.day > 31 ||
      bday.month < 1 || bday.month > 12
    );
    
    if (invalidBirthdays.length === 0) {
      return NextResponse.json({ 
        message: "No invalid birthdays found",
        cleanedCount: 0,
        totalCount: birthdays.length
      });
    }

    // Delete invalid birthdays
    const deletePromises = invalidBirthdays.map(birthday => 
      birthday?.id ? deleteBirthday(birthday.id) : Promise.resolve()
    );
    
    await Promise.all(deletePromises);

    return NextResponse.json({ 
      message: `Successfully cleaned up ${invalidBirthdays.length} invalid birthday entries`,
      cleanedCount: invalidBirthdays.length,
      totalCount: birthdays.length,
      remainingCount: birthdays.length - invalidBirthdays.length
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to cleanup birthdays", 
        details: error instanceof Error ? error.message : String(error) 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 