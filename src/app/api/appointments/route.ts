import { NextResponse } from "next/server";
import { createAppointment, getAppointmentsByPatient, ensureAppointmentsTable } from "@/lib/schema/appointments";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/auth";

// Ensure table exists
ensureAppointmentsTable().catch(console.error);

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const appointments = await getAppointmentsByPatient();
    
    return NextResponse.json(appointments.map(appt => ({
      appointment: appt
    })));
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch appointments", details: error instanceof Error ? error.message : String(error) }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const {
      address,
      programName,
      startTime,
      eventFrom,
      contactNo,
    } = body;

    const appointment = await createAppointment({
      userid: session.user.id || 'default',
      programName,
      address,
      startTime: new Date(startTime).toISOString(),
      status: 'scheduled',
      isUrgent: false,
      notes: '', 
      eventFrom,
      contactNo,
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to create appointment", details: error instanceof Error ? error.message : String(error) }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
