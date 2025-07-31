import { NextResponse } from "next/server";
import { getBirthdays, createBirthday } from "@/lib/schema/birthdays";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/auth";

export async function GET() {
  try {
    const birthdays = await getBirthdays();
    
    // Validate and clean the data before sending
    const cleanedBirthdays = birthdays.map((birthday: import('@/app/types/birthday').Birthday, index: number) => {
      try {
        // Ensure all required fields are present and valid
        if (!birthday || !birthday.id || !birthday.fullName) {
          console.warn(`Invalid birthday at index ${index}: missing required fields`);
          return null;
        }
        
        // Ensure day and month are valid numbers
        if (typeof birthday.day !== 'number' || typeof birthday.month !== 'number') {
          console.warn(`Invalid birthday at index ${index}: invalid day/month types`);
          return null;
        }
        
        // Ensure day and month are in valid ranges
        if (birthday.day < 1 || birthday.day > 31 || birthday.month < 1 || birthday.month > 12) {
          console.warn(`Invalid birthday at index ${index}: day/month out of range`);
          return null;
        }
        
        // Clean the birthday object
        const cleaned: import('@/app/types/birthday').Birthday = {
          id: birthday.id,
          fullName: birthday.fullName,
          day: birthday.day,
          month: birthday.month,
          year: birthday.year || undefined,
          address: birthday.address || undefined,
          phone: birthday.phone || undefined,
          reminder: birthday.reminder || '09:00' // Default reminder time
        };
        
        return cleaned;
      } catch (error) {
        console.error(`Error processing birthday at index ${index}:`, error);
        return null;
      }
    }).filter(Boolean) as import('@/app/types/birthday').Birthday[]; // Remove null entries
    
    return NextResponse.json(cleanedBirthdays);
  } catch (error) {
    console.error('GET /api/birthdays - Error:', error);
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