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
          ward: birthday.ward || undefined,
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
    console.log('Creating birthday with data:', JSON.stringify(body, null, 2));
    
    // Validate required fields
    if (!body.fullName || typeof body.fullName !== 'string') {
      throw new Error('fullName is required and must be a string');
    }
    if (!body.day || typeof body.day !== 'number' || body.day < 1 || body.day > 31) {
      throw new Error('day is required and must be a number between 1 and 31');
    }
    if (!body.month || typeof body.month !== 'number' || body.month < 1 || body.month > 12) {
      throw new Error('month is required and must be a number between 1 and 12');
    }
    if (!body.reminder || typeof body.reminder !== 'string') {
      throw new Error('reminder is required and must be a string');
    }
    
    // Check if this is a bulk import (skip duplicate checking to avoid throttling)
    const isBulkImport = body.skipDuplicateCheck === true;
    
    const newBirthday = await createBirthday(body, isBulkImport);
    return NextResponse.json(newBirthday);
  } catch (error) {
    console.error('POST /api/birthdays - Error:', error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to create birthday", details: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 