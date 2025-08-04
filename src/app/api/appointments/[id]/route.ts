import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateAppointment, deleteAppointment, getAppointmentById } from "@/lib/schema/appointments";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/auth";

interface AppointmentUpdate {
  programName?: string;
  address?: string;
  startTime?: string;
  status?: 'going' | 'not-going' | 'scheduled';
  notes?: string;
  isUrgent?: boolean;
  eventFrom?: string;
  contactNo?: string;
}

export async function PUT(
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

    const requestData = await request.json();
    
    // Validate status if it's being updated
    if (requestData.status && !['scheduled', 'going', 'not-going'].includes(requestData.status)) {
      return new NextResponse("Invalid status value", { status: 400 });
    }

    const updates: AppointmentUpdate = {
      programName: requestData.programName,
      address: requestData.address,
      startTime: requestData.startTime,
      status: requestData.status,
      notes: requestData.notes,
      isUrgent: requestData.isUrgent,
      eventFrom: requestData.eventFrom,
      contactNo: requestData.contactNo,
    };

    // Remove undefined values
    Object.keys(updates).forEach(key => {
      if (updates[key as keyof AppointmentUpdate] === undefined) {
        delete updates[key as keyof AppointmentUpdate];
      }
    });

    const updatedAppointment = await updateAppointment(id, updates);
    if (!updatedAppointment) {
      return new NextResponse("Failed to update appointment", { status: 500 });
    }

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

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

    const requestData = await request.json();
    const updates: AppointmentUpdate = {};
    
    // Handle status update
    if (requestData.status !== undefined) {
      if (!['scheduled', 'going', 'not-going'].includes(requestData.status)) {
        return new NextResponse("Invalid status value", { status: 400 });
      }
      updates.status = requestData.status;
    }

    // Handle isUrgent update
    if (requestData.isUrgent !== undefined) {
      updates.isUrgent = requestData.isUrgent;
    }

    // If no valid updates, return error
    if (Object.keys(updates).length === 0) {
      return new NextResponse("No valid updates provided", { status: 400 });
    }

    const updatedAppointment = await updateAppointment(id, updates);
    if (!updatedAppointment) {
      return new NextResponse("Failed to update appointment", { status: 500 });
    }

    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
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

    await deleteAppointment(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}