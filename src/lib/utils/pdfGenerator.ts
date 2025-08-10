import { CalendarEvent } from '@/app/types';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType, AlignmentType, BorderStyle, VerticalAlign } from 'docx';
import saveAs from 'file-saver';
import { toMarathiDigits, toMarathiTime, getMarathiDay } from '@/app/utils/dateUtils';

export interface PDFGeneratorOptions {
  title?: string;
  subtitle?: string;
  showUrgentOnly?: boolean;
  personName?: string;
}



export const generateAppointmentsDocx = async (events: CalendarEvent[], options: PDFGeneratorOptions = {}) => {
  const {
    personName = 'माननीय आमदार ताजिंदर सिंह तिवाना जी'
  } = options;
  
  const filteredEvents = events;
  const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.appointment.startTime).getTime() - new Date(b.appointment.startTime).getTime());

  // Get current date for header
  const currentDate = new Date();
  const marathiDate = `${toMarathiDigits(currentDate.getDate())}/${toMarathiDigits(currentDate.getMonth() + 1)}/${toMarathiDigits(currentDate.getFullYear())}`;
  const marathiDay = getMarathiDay(currentDate);

  // Main title
  const mainTitle = `${personName} यांचे कार्यक्रम`;
  
  // Table header in Marathi (matching the image format)
  const tableHeader = [
    'अ.क्र', 'वेळ', 'कार्यक्रम', 'स्थान / संपर्क व्यक्ती'
  ];

  // Helper to create a styled cell
  const makeCell = (text: string, align: typeof AlignmentType[keyof typeof AlignmentType] = AlignmentType.LEFT, isHeader: boolean = false, isTitle: boolean = false) =>
    new TableCell({
      children: [
        new Paragraph({
          children: [new TextRun({ 
            text, 
            font: 'Arial', 
            size: 36,
            bold: isHeader || isTitle
          })],
          alignment: align,
        })
      ],
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 100, bottom: 100, left: 100, right: 100 },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 8, color: '333333' },
        bottom: { style: BorderStyle.SINGLE, size: 8, color: '333333' },
        left: { style: BorderStyle.SINGLE, size: 8, color: '333333' },
        right: { style: BorderStyle.SINGLE, size: 8, color: '333333' },
      },
    });

  // Title row
  const titleRow = new TableRow({
    children: [
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ 
              text: mainTitle, 
              font: 'Arial', 
              size: 36,
              bold: true
            })],
            alignment: AlignmentType.CENTER,
          })
        ],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 150, bottom: 100, left: 100, right: 100 },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 8, color: '333333' },
          bottom: { style: BorderStyle.SINGLE, size: 8, color: '333333' },
          left: { style: BorderStyle.SINGLE, size: 8, color: '333333' },
          right: { style: BorderStyle.SINGLE, size: 8, color: '333333' },
        },
        columnSpan: 4,
      })
    ],
  });

  // Date row
  const dateRow = new TableRow({
    children: [
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ 
              text: `${marathiDate} (${marathiDay})`, 
              font: 'Arial', 
              size: 36,
              bold: true
            })],
            alignment: AlignmentType.CENTER,
          })
        ],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 8, color: '333333' },
          bottom: { style: BorderStyle.SINGLE, size: 8, color: '333333' },
          left: { style: BorderStyle.SINGLE, size: 8, color: '333333' },
          right: { style: BorderStyle.SINGLE, size: 8, color: '333333' },
        },
        columnSpan: 4,
      })
    ],
  });

  // Special row for public relations office time slot
  const specialRow = new TableRow({
    children: [
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ 
              text: 'सकाळी ९.०० ते ११.०० वाजता (जनसंपर्क कार्यालय)', 
              font: 'Arial', 
              size: 36,
              bold: true
            })],
            alignment: AlignmentType.CENTER,
          })
        ],
        verticalAlign: VerticalAlign.CENTER,
        margins: { top: 100, bottom: 100, left: 100, right: 100 },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 8, color: '333333' },
          bottom: { style: BorderStyle.SINGLE, size: 8, color: '333333' },
          left: { style: BorderStyle.SINGLE, size: 8, color: '333333' },
          right: { style: BorderStyle.SINGLE, size: 8, color: '333333' },
        },
        shading: {
          fill: 'F2F2F2',
        },
        columnSpan: 4,
      })
    ],
  });

  // Table rows
  const tableRows = [
    titleRow,
    dateRow,
    new TableRow({
      children: tableHeader.map(header =>
        makeCell(header, AlignmentType.CENTER, true)
      ),
      tableHeader: true,
    }),
    specialRow,
    ...sortedEvents.map((event, index) =>
      new TableRow({
        children: [
          makeCell(toMarathiDigits(index + 1), AlignmentType.CENTER),
          makeCell(toMarathiTime(event.appointment.startTime), AlignmentType.CENTER),
          makeCell(event.appointment.programName, AlignmentType.LEFT),
          makeCell(`${event.appointment.address}\n${event.appointment.eventFrom}\n${event.appointment.contactNo || ''}`, AlignmentType.LEFT),
        ]
      })
    )
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906, // A4 width in twips
              height: 16838, // A4 height in twips
            },
            margin: {
              top: 1440, // 1 inch top margin
              right: 1440, // 1 inch right margin
              bottom: 1440, // 1 inch bottom margin
              left: 1440, // 1 inch left margin
            },
          },
        },
        children: [
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 8, color: '333333' },
              bottom: { style: BorderStyle.SINGLE, size: 8, color: '333333' },
              left: { style: BorderStyle.SINGLE, size: 8, color: '333333' },
              right: { style: BorderStyle.SINGLE, size: 8, color: '333333' },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 8, color: '333333' },
              insideVertical: { style: BorderStyle.SINGLE, size: 8, color: '333333' },
            },
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, 'marathi-schedule.docx');
};
