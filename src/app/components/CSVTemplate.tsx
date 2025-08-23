"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export default function CSVTemplate() {
  const downloadTemplate = () => {
    const csvContent = `fullName,day,month,phone,address,ward
John Doe,15,3,9876543210,123 Main St, Ward 1
Jane Smith,22,8,9876543211,456 Oak Ave, Ward 2
Mike Johnson,7,12,9876543212,789 Pine Rd, Ward 3`;

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

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={downloadTemplate}
      className="text-xs"
    >
      <Download className="h-3 w-3 mr-1" />
      Download Template
    </Button>
  );
}
