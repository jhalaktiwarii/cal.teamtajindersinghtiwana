import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth";
import { createBirthday } from "@/lib/schema/birthdays";
import * as XLSX from 'xlsx';

interface ImportResult {
  success: number;
  failed: number;
  replaced: number; // New field for replaced duplicates
  errors: string[];
}

// Helper function to parse file and extract birthdays
async function parseBirthdayFile(file: File): Promise<{ jsonData: string[][], headers: string[] }> {
  // Convert file to buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Parse Excel/CSV file
  let workbook: XLSX.WorkBook;

  if (file.name.endsWith('.csv')) {
    // Handle CSV - use proper encoding
    const csvString = buffer.toString('utf-8');
    workbook = XLSX.read(csvString, { type: 'string' });
  } else {
    // Handle Excel files
    workbook = XLSX.read(buffer, { type: 'buffer' });
  }

  // Get first worksheet
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
  const headers = jsonData[0] || [];

  return { jsonData, headers };
}

// Helper function to validate and parse birthday data
function validateBirthdayRow(row: string[], headers: string[], rowNumber: number): { 
  isValid: boolean; 
  birthday?: Omit<import('@/app/types/birthday').Birthday, 'id'>; 
  error?: string; 
} {
  // Find column indices
  const nameIndex = headers.findIndex(h => h?.toString().toLowerCase().includes('full name'));
  const addressIndex = headers.findIndex(h => h?.toString().toLowerCase().includes('address'));
  const phoneIndex = headers.findIndex(h => h?.toString().toLowerCase().includes('phone'));
  const dayIndex = headers.findIndex(h => h?.toString().toLowerCase().includes('day'));
  const monthIndex = headers.findIndex(h => h?.toString().toLowerCase().includes('month'));
  const yearIndex = headers.findIndex(h => h?.toString().toLowerCase().includes('year'));

  // Extract data with proper null/undefined handling
  const fullName = row[nameIndex]?.toString()?.trim() || '';
  const address = row[addressIndex]?.toString()?.trim() || '';
  const phone = row[phoneIndex]?.toString()?.trim() || '';
  const dayStr = row[dayIndex]?.toString()?.trim() || '';
  const monthStr = row[monthIndex]?.toString()?.trim() || '';
  const yearStr = row[yearIndex]?.toString()?.trim() || '';

  // Validate Full Name (required)
  if (!fullName) {
    return { 
      isValid: false, 
      error: `Row ${rowNumber}: Missing Full Name` 
    };
  }

  // Validate Day (required)
  if (!dayStr) {
    return { 
      isValid: false, 
      error: `Row ${rowNumber}: Missing Day` 
    };
  }

  // Validate Month (required)
  if (!monthStr) {
    return { 
      isValid: false, 
      error: `Row ${rowNumber}: Missing Month` 
    };
  }

  // Parse day, month as numbers
  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10);
  const year = yearStr ? parseInt(yearStr, 10) : undefined;

  // Validate day
  if (isNaN(day) || day < 1 || day > 31) {
    return { 
      isValid: false, 
      error: `Row ${rowNumber}: Invalid day value. Must be 1-31. Found: "${dayStr}"` 
    };
  }

  // Validate month
  if (isNaN(month) || month < 1 || month > 12) {
    return { 
      isValid: false, 
      error: `Row ${rowNumber}: Invalid month value. Must be 1-12. Found: "${monthStr}"` 
    };
  }

  // Validate year if provided
  if (yearStr && (isNaN(year!) || year! < 1900 || year! > new Date().getFullYear())) {
    return { 
      isValid: false, 
      error: `Row ${rowNumber}: Invalid year value. Must be 1900-${new Date().getFullYear()}. Found: "${yearStr}"` 
    };
  }

  // Validate date is valid (check for leap years, month lengths, etc.)
  if (year) {
    const parsedDate = new Date(year, month - 1, day);
    if (parsedDate.getDate() !== day || parsedDate.getMonth() !== month - 1 || parsedDate.getFullYear() !== year) {
      return { 
        isValid: false, 
        error: `Row ${rowNumber}: Invalid date (e.g., 31-02-1990 is not valid)` 
      };
    }
  } else {
    // If no year provided, just check if the day is valid for the month
    const testYear = 2000; // Use leap year to handle February 29
    const parsedDate = new Date(testYear, month - 1, day);
    if (parsedDate.getDate() !== day || parsedDate.getMonth() !== month - 1) {
      return { 
        isValid: false, 
        error: `Row ${rowNumber}: Invalid date (e.g., 31-02 is not valid)` 
      };
    }
  }

  // Validate phone number only if provided
  if (phone && phone.length < 10) {
    return { 
      isValid: false, 
      error: `Row ${rowNumber}: Phone number too short. Must be at least 10 digits. Found: "${phone}"` 
    };
  }

  // Create birthday object
  const birthday: Omit<import('@/app/types/birthday').Birthday, 'id'> = {
    fullName,
    day,
    month,
    year,
    address: address || undefined,
    phone: phone || undefined,
    reminder: '09:00' // Default reminder time
  };

  return { isValid: true, birthday };
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new NextResponse(
        JSON.stringify({ error: "No file provided" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];

    if (!validTypes.includes(file.type) && 
        !file.name.endsWith('.xlsx') && 
        !file.name.endsWith('.xls') && 
        !file.name.endsWith('.csv')) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid file type. Please upload an Excel (.xlsx, .xls) or CSV file." }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { jsonData, headers } = await parseBirthdayFile(file);

    if (jsonData.length < 2) {
      return new NextResponse(
        JSON.stringify({ error: "File is empty or has no data rows" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate headers
    const requiredHeaders = ['Full Name', 'Day', 'Month'];
    
    const missingHeaders = requiredHeaders.filter(header => 
      !headers.some(h => h?.toString().toLowerCase().includes(header.toLowerCase()))
    );

    if (missingHeaders.length > 0) {
      return new NextResponse(
        JSON.stringify({ 
          error: `Missing required headers: ${missingHeaders.join(', ')}. Required headers: ${requiredHeaders.join(', ')}. Optional headers: Address, Phone, Year.` 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Process data rows
    const result: ImportResult = {
      success: 0,
      failed: 0,
      replaced: 0,
      errors: []
    };

    // Process each row (skip header)
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 1;

      try {
        const validation = validateBirthdayRow(row, headers, rowNumber);
        
        if (!validation.isValid) {
          result.failed++;
          result.errors.push(validation.error || `Row ${rowNumber}: Unknown error`);
          continue;
        }

        if (!validation.birthday) {
          result.failed++;
          result.errors.push(`Row ${rowNumber}: Failed to parse birthday data`);
          continue;
        }

        const { wasReplaced } = await createBirthday(validation.birthday);
        
        // Track whether this was a replacement or new entry
        if (wasReplaced) {
          result.replaced++;
        } else {
          result.success++;
        }

      } catch (error) {
        result.failed++;
        result.errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Import error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to process file", 
        details: error instanceof Error ? error.message : String(error) 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 