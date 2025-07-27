import { NextResponse } from 'next/server'
import { dynamoDb } from '@/lib/dynamodb'
import { BatchWriteCommand } from '@aws-sdk/lib-dynamodb'

export async function POST(request: Request) {
  try {
    const { appointmentIds } = await request.json()

    if (!Array.isArray(appointmentIds) || appointmentIds.length === 0) {
      return NextResponse.json(
        { message: 'Invalid appointment IDs' },
        { status: 400 }
      )
    }

    // DynamoDB BatchWrite can only handle 25 items at a time
    const chunks = []
    for (let i = 0; i < appointmentIds.length; i += 25) {
      chunks.push(appointmentIds.slice(i, i + 25))
    }

    for (const chunk of chunks) {
      const deleteRequests = chunk.map(id => ({
        DeleteRequest: {
          Key: { id }
        }
      }))

      const batchWriteCommand = new BatchWriteCommand({
        RequestItems: {
          Appointments: deleteRequests
        }
      })

      await dynamoDb.send(batchWriteCommand)
    }

    return NextResponse.json({ message: 'Appointments deleted successfully' })
  } catch (error) {
    console.error('Error deleting appointments:', error)
    return NextResponse.json(
      { message: 'Failed to delete appointments' },
      { status: 500 }
    )
  }
}
