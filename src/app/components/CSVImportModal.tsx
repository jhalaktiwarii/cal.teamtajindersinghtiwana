"use client"

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle, CheckCircle, Download, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import type { Birthday } from '@/app/types/birthday';

interface CSVImportModalProps {
  open: boolean;
  onClose: () => void;
  onImportComplete: () => void;
}

interface CSVRow {
  fullName: string;
  day: number;
  month: number;
  phone?: string;
  address?: string;
  ward?: string;
}

export default function CSVImportModal({ open, onClose, onImportComplete }: CSVImportModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<CSVRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);
  const [failedImports, setFailedImports] = useState<CSVRow[]>([]);
  const [isResuming, setIsResuming] = useState(false);

  // Helper function to auto-correct common issues in date strings
  const autoCorrectDateString = (dateString: string): string => {
    let corrected = dateString.trim();
    
    // Fix ordinal suffixes
    corrected = corrected.replace(/(\d+)nt\s/g, '$1nd '); // 2nt → 2nd
    corrected = corrected.replace(/(\d+)nt([A-Za-z])/g, '$1nd $2'); // 2ntJanuary → 2nd January
    corrected = corrected.replace(/(\d+)rd\s/g, '$1rd '); // already correct but normalize
    corrected = corrected.replace(/(\d+)th\s/g, '$1th '); // already correct but normalize
    corrected = corrected.replace(/(\d+)st\s/g, '$1st '); // already correct but normalize
    
    // Add missing spaces between day and month
    corrected = corrected.replace(/(\d+(?:st|nd|rd|th))([A-Za-z])/g, '$1 $2'); // 7thApril → 7th April
    
    // Fix common month typos
    corrected = corrected.replace(/spetember/gi, 'September');
    corrected = corrected.replace(/novembar/gi, 'November');
    corrected = corrected.replace(/marth/gi, 'March');
    corrected = corrected.replace(/feburary/gi, 'February');
    corrected = corrected.replace(/septembar/gi, 'September');
    corrected = corrected.replace(/octobar/gi, 'October');
    corrected = corrected.replace(/decembar/gi, 'December');
    
    return corrected;
  };

  // Helper function to convert age to approximate birth date
  const convertAgeToDate = (ageString: string): { day: number; month: number } | null => {
    const ageMatch = ageString.match(/(\d+)\s*years?/i);
    if (ageMatch) {
      // Use January 1st as default birth date for age conversions
      return { day: 1, month: 1 };
    }
    return null;
  };

  // Helper function to parse Date of Birth
  const parseDateOfBirth = (dateString: string): { day: number; month: number } | null => {
    if (!dateString || dateString.trim() === '') return null;
    
    const trimmed = dateString.trim();
    
    // First, check if it's an age value and convert it
    if (trimmed.match(/\d+\s*years?/i)) {
      return convertAgeToDate(trimmed);
    }
    
    // Auto-correct common issues
    const corrected = autoCorrectDateString(trimmed);
    
    // Month name mapping
    const monthNames: { [key: string]: number } = {
      'january': 1, 'jan': 1,
      'february': 2, 'feb': 2,
      'march': 3, 'mar': 3,
      'april': 4, 'apr': 4,
      'may': 5,
      'june': 6, 'jun': 6,
      'july': 7, 'jul': 7,
      'august': 8, 'aug': 8,
      'september': 9, 'sep': 9, 'sept': 9,
      'october': 10, 'oct': 10,
      'november': 11, 'nov': 11,
      'december': 12, 'dec': 12
    };
    
    // Try different date formats on the corrected string
    const formats = [
      // DD/MM/YYYY or DD-MM-YYYY
      /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,
      // MM/DD/YYYY or MM-DD-YYYY  
      /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,
      // DD/MM or DD-MM
      /^(\d{1,2})[\/\-](\d{1,2})$/,
      // MM/DD or MM-DD
      /^(\d{1,2})[\/\-](\d{1,2})$/,
    ];
    
    // Try numeric formats first on corrected string
    for (const format of formats) {
      const match = corrected.match(format);
      if (match) {
        let day, month;
        
        if (match.length === 4) {
          // Full date format
          if (parseInt(match[1]) <= 12) {
            // Likely MM/DD/YYYY
            month = parseInt(match[1]);
            day = parseInt(match[2]);
          } else {
            // Likely DD/MM/YYYY
            day = parseInt(match[1]);
            month = parseInt(match[2]);
          }
        } else {
          // Short date format
          if (parseInt(match[1]) <= 12) {
            // Likely MM/DD
            month = parseInt(match[1]);
            day = parseInt(match[2]);
          } else {
            // Likely DD/MM
            day = parseInt(match[1]);
            month = parseInt(match[2]);
          }
        }
        
        if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
          return { day, month };
        }
      }
    }
    
    // Try text format: "20th August", "1st April", etc. on corrected string
    const textFormat = /^(\d{1,2})(?:st|nd|rd|th)?\s+([a-zA-Z]+)$/i;
    const textMatch = corrected.match(textFormat);
    if (textMatch) {
      const day = parseInt(textMatch[1]);
      const monthName = textMatch[2].toLowerCase();
      const month = monthNames[monthName];
      
      if (day >= 1 && day <= 31 && month) {
        return { day, month };
      }
    }
    
    // Try DD-MMM format: "16-Mar", "7-Apr", etc. on corrected string
    const shortTextFormat = /^(\d{1,2})-([a-zA-Z]{3,})$/i;
    const shortTextMatch = corrected.match(shortTextFormat);
    if (shortTextMatch) {
      const day = parseInt(shortTextMatch[1]);
      const monthName = shortTextMatch[2].toLowerCase();
      const month = monthNames[monthName];
      
      if (day >= 1 && day <= 31 && month) {
        return { day, month };
      }
    }
    
    return null;
  };

  // Helper function to properly parse CSV line with quoted fields
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator (only when not in quotes)
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add the last field
    result.push(current.trim());
    return result;
  };

  const parseCSV = (csvText: string): CSVRow[] => {
    const lines = csvText.trim().split('\n');
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
    
    // Check for all three formats - handle spaces in column names
    const format1Headers = ['fullname', 'day', 'month'];
    const format2Headers = ['name', 'date of birth', 'phone no'];
    const format3Headers = ['name', 'dateofbirth', 'phone no'];
    
    const hasFormat1 = format1Headers.every(header => headers.includes(header));
    const hasFormat2 = format2Headers.every(header => headers.includes(header));
    const hasFormat3 = format3Headers.every(header => headers.includes(header));
    
    if (!hasFormat1 && !hasFormat2 && !hasFormat3) {
      throw new Error('CSV must contain either: fullName, day, month OR Name, Phone No, Date of Birth, Address OR Name, DateOfBirth, Phone No, Address');
    }

         const data: CSVRow[] = [];
     const warnings: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = parseCSVLine(line);
             const row: Record<string, string> = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      let fullName: string;
      let day: number;
      let month: number;

      // Handle Format 1: fullName, day, month
      if (hasFormat1) {
        if (!row.fullname || row.fullname.trim() === '') {
          fullName = `⚠️ MISSING NAME - Row ${i + 1}`;
          warnings.push(`Row ${i + 1}: Missing full name - using placeholder`);
        } else {
          fullName = row.fullname;
        }

        const parsedDay = parseInt(row.day);
        const parsedMonth = parseInt(row.month);

        if (isNaN(parsedDay) || parsedDay < 1 || parsedDay > 31 || !row.day || row.day.trim() === '') {
          day = 1;
          month = 1;
          warnings.push(`Row ${i + 1}: ${fullName} - Missing or invalid day - using January 1st`);
        } else if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12 || !row.month || row.month.trim() === '') {
          day = 1;
          month = 1;
          warnings.push(`Row ${i + 1}: ${fullName} - Missing or invalid month - using January 1st`);
        } else {
          day = parsedDay;
          month = parsedMonth;
        }
      }
                          // Handle Format 2: name, date of birth
       else if (hasFormat2) {
         if (!row.name || row.name.trim() === '') {
           fullName = `⚠️ MISSING NAME - Row ${i + 1}`;
           warnings.push(`Row ${i + 1}: Missing name - using placeholder`);
         } else {
           fullName = row.name;
         }

         if (!row['date of birth'] || row['date of birth'].trim() === '') {
           day = 1;
           month = 1;
           warnings.push(`Row ${i + 1}: ${fullName} - Missing date of birth - using January 1st`);
         } else {
           const originalDate = row['date of birth'];
           const parsedDate = parseDateOfBirth(originalDate);
           
           if (!parsedDate) {
             day = 1;
             month = 1;
             warnings.push(`Row ${i + 1}: ${fullName} - Could not parse date "${originalDate}" - using January 1st`);
           } else {
             // Check if auto-correction was applied and add warnings
             const correctedDate = autoCorrectDateString(originalDate);
             if (originalDate !== correctedDate && !originalDate.match(/\d+\s*years?/i)) {
               warnings.push(`Row ${i + 1}: ${fullName} - Auto-corrected date from "${originalDate}" to "${correctedDate}"`);
             }
             
             // Special warning for age conversion
             if (originalDate.match(/\d+\s*years?/i)) {
               warnings.push(`Row ${i + 1}: ${fullName} - Converted age "${originalDate}" to January 1st (estimated birth date)`);
             }

             day = parsedDate.day;
             month = parsedDate.month;
           }
         }
       }
       // Handle Format 3: name, dateofbirth, phone no
       else if (hasFormat3) {
         if (!row.name || row.name.trim() === '') {
           fullName = `⚠️ MISSING NAME - Row ${i + 1}`;
           warnings.push(`Row ${i + 1}: Missing name - using placeholder`);
         } else {
           fullName = row.name;
         }

         if (!row.dateofbirth || row.dateofbirth.trim() === '') {
           day = 1;
           month = 1;
           warnings.push(`Row ${i + 1}: ${fullName} - Missing date of birth - using January 1st`);
         } else {
           const originalDate = row.dateofbirth;
           const parsedDate = parseDateOfBirth(originalDate);
           
           if (!parsedDate) {
             day = 1;
             month = 1;
             warnings.push(`Row ${i + 1}: ${fullName} - Could not parse date "${originalDate}" - using January 1st`);
           } else {
             // Check if auto-correction was applied and add warnings
             const correctedDate = autoCorrectDateString(originalDate);
             if (originalDate !== correctedDate && !originalDate.match(/\d+\s*years?/i)) {
               warnings.push(`Row ${i + 1}: ${fullName} - Auto-corrected date from "${originalDate}" to "${correctedDate}"`);
             }
             
             // Special warning for age conversion
             if (originalDate.match(/\d+\s*years?/i)) {
               warnings.push(`Row ${i + 1}: ${fullName} - Converted age "${originalDate}" to January 1st (estimated birth date)`);
             }

             day = parsedDate.day;
             month = parsedDate.month;
           }
         }
       } else {
        continue; // Should not reach here due to header validation
       }

      // Check for missing optional fields and add warnings
      const phoneField = hasFormat1 ? row.phone : (hasFormat2 ? row['phone no'] : row['phone no']);
      const addressField = row.address;
      const wardField = row.ward;

      if (!phoneField || phoneField.trim() === '') {
        warnings.push(`Row ${i + 1}: ${fullName} - Missing phone number`);
      }
      if (!addressField || addressField.trim() === '') {
        warnings.push(`Row ${i + 1}: ${fullName} - Missing address`);
      }
      if (!wardField || wardField.trim() === '') {
        warnings.push(`Row ${i + 1}: ${fullName} - Missing ward information`);
      }

      data.push({
        fullName,
        day,
        month,
        phone: phoneField && phoneField.trim() !== '' ? phoneField : undefined,
        address: addressField && addressField.trim() !== '' ? addressField : undefined,
        ward: wardField && wardField.trim() !== '' ? wardField : undefined,
      });
    }

    // Always return data, even with missing fields (now handled as warnings)
    setValidationErrors([]);
    setWarnings(warnings);
    return data;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const parsedData = parseCSV(csvText);
        setPreviewData(parsedData);
      } catch (error) {
        toast.error(`Error parsing CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setPreviewData([]);
      } finally {
        setIsLoading(false);
      }
    };

    reader.readAsText(file);
  };

  const processImports = async (dataToImport: CSVRow[]) => {
    try {
      // Import birthdays in batches to avoid DynamoDB throttling
      const batchSize = 5; // Process 5 at a time
      const results: PromiseSettledResult<unknown>[] = [];
      
      for (let i = 0; i < dataToImport.length; i += batchSize) {
        const batch = dataToImport.slice(i, i + batchSize);
        setImportProgress({ current: i + batch.length, total: dataToImport.length });
          
        const batchPromises = batch.map(async (row) => {
          try {
            const birthdayData: Omit<Birthday, 'id'> & { skipDuplicateCheck: boolean } = {
              fullName: row.fullName,
              day: row.day,
              month: row.month,
              phone: row.phone,
              address: row.address,
              ward: row.ward,
              reminder: '09:00', // Use simple time format instead of ISO string
              skipDuplicateCheck: true, // Skip duplicate checking to avoid throttling
            };

            const response = await fetch('/api/birthdays', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(birthdayData),
            });

            if (!response.ok) {
              const errorData = await response.text();
              console.error(`Failed to import ${row.fullName}:`, errorData);
              
              // Check if it's a 404 or server restart issue
              if (response.status === 404 || errorData.includes('404') || errorData.includes('This page could not be found')) {
                throw new Error(`Server restart detected - ${row.fullName} needs retry`);
              }
              
              throw new Error(`Failed to import ${row.fullName}: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            return result;
          } catch (error) {
            console.error(`Error importing ${row.fullName}:`, error);
            throw error;
          }
        });

        // Wait for current batch to complete before starting next batch
        const batchResults = await Promise.allSettled(batchPromises);
        results.push(...batchResults);
        
        // Add a small delay between batches to avoid throttling
        if (i + batchSize < dataToImport.length) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        }
      }

      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected');
      
      if (failed.length > 0) {
        console.error('Failed imports:', failed);
        
        // Collect failed imports for retry option
        const failedRows: CSVRow[] = [];
        failed.forEach((result) => {
          if (result.status === 'rejected') {
            const originalIndex = results.indexOf(result);
            if (originalIndex >= 0 && dataToImport[originalIndex]) {
              failedRows.push(dataToImport[originalIndex]);
            }
          }
        });
        
        if (!isResuming) {
          setFailedImports(failedRows);
        }
        
        const failedNames = failed.map((result) => {
          if (result.status === 'rejected') {
            const errorMessage = result.reason?.message || 'Unknown error';
            const originalIndex = results.indexOf(result);
            return `${dataToImport[originalIndex]?.fullName || 'Unknown'}: ${errorMessage}`;
          }
          return '';
        }).filter(Boolean);
        
        toast.error(`${failed.length} imports failed. ${successful} succeeded.\nFailed: ${failedNames.slice(0, 3).join(', ')}${failedNames.length > 3 ? '...' : ''}`);
        
        if (successful > 0) {
          onImportComplete(); // Refresh to show successfully imported data
        }
      } else {
        toast.success(`Successfully imported ${successful} birthdays`);
        onImportComplete();
        handleClose();
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import birthdays. Please try again.');
      throw error; // Re-throw to be caught by calling function
    }
  };

  const handleRetryFailed = async () => {
    if (failedImports.length === 0) {
      toast.error('No failed imports to retry');
      return;
    }

    setIsResuming(true);
    setIsLoading(true);
    
    try {
      // Use the same batch processing for failed imports
      await processImports(failedImports);
      setFailedImports([]); // Clear failed imports after successful retry
    } catch (error) {
      console.error('Retry error:', error);
      toast.error('Failed to retry imports. Please try again.');
    } finally {
      setIsLoading(false);
      setIsResuming(false);
    }
  };

  const handleImport = async () => {
    if (previewData.length === 0) {
      toast.error('No valid data to import');
      return;
    }

    setIsLoading(true);
    try {
      await processImports(previewData);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import birthdays. Please try again.');
    } finally {
      setIsLoading(false);
      setImportProgress(null);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `Name,Phone No,Date of Birth,Address
John Doe,9876543210,15/03/1990,"123 Main St, City"
Jane Smith,9876543211,22nd August,"456 Oak Ave, Town"
Mike Johnson,9876543212,7th December,"789 Pine Rd, Village"
Pravin Tandalekar,9870107065,20th August,"B/306, Vimlachal Apts, Evershine Nagar"`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'birthday_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setPreviewData([]);
    setFileName('');
    setValidationErrors([]);
    setWarnings([]);
    setImportProgress(null);
    setFailedImports([]);
    setIsResuming(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Import Birthdays from CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 mb-2">
              Upload a CSV file with birthday data
            </p>
                         <p className="text-xs text-gray-500 mb-4">
               <strong>Format 1:</strong> fullName, day, month, phone, address, ward<br />
               <strong>Format 2:</strong> Name, Phone No, Date of Birth, Address<br />
               <strong>Format 3:</strong> Name, DateOfBirth, Phone No, Address<br />
               <strong>Date formats:</strong> DD/MM/YYYY, DD/MM, MM/DD/YYYY, MM/DD, "20th August", "16-Mar"<br />
               <strong>Addresses with commas:</strong> Use quotes: "Vyom C/6, Zalawad"<br />
               <strong>Auto-corrections:</strong> Typos, ordinal suffixes, missing spaces, age values → Jan 1st<br />
               <strong>Missing data:</strong> Uses placeholders with ⚠️ warnings - still imports!
             </p>
             <Button
               variant="outline"
               size="sm"
               onClick={downloadTemplate}
               className="text-xs mb-4"
             >
               <Download className="h-3 w-3 mr-1" />
               Download Template
             </Button>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer"
            >
              Choose CSV File
            </label>
            {fileName && (
              <p className="text-sm text-gray-600 mt-2">
                Selected: {fileName}
              </p>
            )}
          </div>

                     {/* Validation Errors */}
           {validationErrors.length > 0 && (
             <div className="bg-red-50 border border-red-200 rounded-lg p-4">
               <div className="flex items-center gap-2 mb-2">
                 <AlertCircle className="h-4 w-4 text-red-500" />
                 <h4 className="font-medium text-red-800">Validation Errors</h4>
               </div>
               <ul className="text-sm text-red-700 space-y-1">
                 {validationErrors.map((error, index) => (
                   <li key={index}>• {error}</li>
                 ))}
               </ul>
             </div>
           )}

           {/* Warnings */}
           {warnings.length > 0 && (
             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
               <div className="flex items-center gap-2 mb-2">
                 <AlertTriangle className="h-4 w-4 text-yellow-600" />
                 <h4 className="font-medium text-yellow-800">Warnings</h4>
               </div>
               <div className="text-sm text-yellow-700">
                 <p className="mb-2">The following entries have missing optional information:</p>
                 <ul className="space-y-1 max-h-32 overflow-y-auto">
                   {warnings.map((warning, index) => (
                     <li key={index} className="flex items-start gap-2">
                       <span className="text-yellow-600">⚠</span>
                       <span>{warning}</span>
                     </li>
                   ))}
                 </ul>
                 <p className="mt-2 text-xs text-yellow-600">
                   These entries will still be imported, but you may want to add the missing information later.
                 </p>
               </div>
             </div>
           )}

          {/* Preview Data */}
          {previewData.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <h4 className="font-medium text-green-800">
                  Preview ({previewData.length} birthdays)
                </h4>
              </div>
              <div className="max-h-40 overflow-y-auto">
                                 <table className="w-full text-sm">
                   <thead>
                     <tr className="border-b border-green-200">
                       <th className="text-left py-1">Name</th>
                       <th className="text-left py-1">Date</th>
                       <th className="text-left py-1">Phone</th>
                       <th className="text-left py-1">Address</th>
                       <th className="text-left py-1">Ward</th>
                     </tr>
                   </thead>
                   <tbody>
                     {previewData.slice(0, 5).map((row, index) => (
                       <tr key={index} className="border-b border-green-100">
                         <td className="py-1">
                           {row.fullName.includes('⚠️ MISSING NAME') ? (
                             <span className="text-red-600 font-semibold">{row.fullName}</span>
                           ) : (
                             row.fullName
                           )}
                         </td>
                         <td className="py-1">
                           {row.day === 1 && row.month === 1 ? (
                             <span className="text-red-600 font-semibold">⚠️ {row.day}/{row.month}</span>
                           ) : (
                             `${row.day}/${row.month}`
                           )}
                         </td>
                         <td className="py-1">
                           {row.phone ? (
                             row.phone
                           ) : (
                             <span className="text-yellow-600 text-xs">⚠ Missing</span>
                           )}
                         </td>
                         <td className="py-1">
                           {row.address ? (
                             <span className="truncate max-w-20 block" title={row.address}>
                               {row.address}
                             </span>
                           ) : (
                             <span className="text-yellow-600 text-xs">⚠ Missing</span>
                           )}
                         </td>
                         <td className="py-1">
                           {row.ward ? (
                             row.ward
                           ) : (
                             <span className="text-yellow-600 text-xs">⚠ Missing</span>
                           )}
                         </td>
                       </tr>
                     ))}
                     {previewData.length > 5 && (
                       <tr>
                         <td colSpan={5} className="py-1 text-xs text-green-600">
                           ... and {previewData.length - 5} more
                         </td>
                       </tr>
                     )}
                   </tbody>
                 </table>
              </div>
            </div>
          )}

          {/* Failed Imports Section */}
          {failedImports.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800">
                  {failedImports.length} Failed Imports
                </span>
              </div>
              <div className="text-sm text-red-600 mb-3">
                These imports failed due to server issues. Click "Retry Failed" to try importing them again.
              </div>
              <div className="max-h-32 overflow-y-auto">
                {failedImports.slice(0, 10).map((row, index) => (
                  <div key={index} className="text-xs text-red-700 py-1">
                    • {row.fullName} ({row.day}/{row.month})
                  </div>
                ))}
                {failedImports.length > 10 && (
                  <div className="text-xs text-red-600 py-1">
                    ... and {failedImports.length - 10} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            
            {failedImports.length > 0 && (
              <Button 
                onClick={handleRetryFailed} 
                disabled={isLoading}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {isLoading && isResuming ? `Retrying ${importProgress?.current || 0}/${importProgress?.total || failedImports.length}...` : `Retry ${failedImports.length} Failed`}
              </Button>
            )}
            
            <Button
               onClick={handleImport}
               disabled={isLoading || previewData.length === 0 || validationErrors.length > 0}
               className="bg-blue-500 hover:bg-blue-600"
             >
                               {isLoading ? (
                  <span className="flex items-center gap-2">
                    {importProgress ? (
                      `Importing ${importProgress.current}/${importProgress.total}...`
                    ) : (
                      'Importing...'
                    )}
                    {warnings.length > 0 && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        {warnings.length} warnings
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Import {previewData.length} Birthdays
                    {warnings.length > 0 && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        {warnings.length} warnings
                      </span>
                    )}
                  </span>
                )}
             </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
