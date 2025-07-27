import { NextRequest, NextResponse } from "next/server";
import { updateAppointment, getAppointmentById } from "@/lib/schema/appointments";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const appointment = await getAppointmentById(id);
    if (!appointment) {
      return new NextResponse("Appointment not found", { status: 404 });
    }

    const { status } = await request.json();
    
    // Validate status
    if (!['going', 'not-going', 'scheduled'].includes(status)) {
      return new NextResponse("Invalid status value. Must be one of: going, not-going, scheduled", { status: 400 });
    }

    const updatedAppointment = await updateAppointment(id, { status });
    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment status:', error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
