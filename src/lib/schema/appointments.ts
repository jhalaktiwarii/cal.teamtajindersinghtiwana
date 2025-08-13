import { CreateTableCommand, DynamoDBClient, ListTablesCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, GetCommand, PutCommand,  UpdateCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "../dynamodb";
import { getTableName } from "./constants";

let tableInitialized = false;

export async function ensureAppointmentsTable() {
  if (tableInitialized) {
    return;
  }

  const client = new DynamoDBClient({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    region: process.env.AWS_REGION,
  });

  try {
    // First check if table exists
    const listTablesResponse = await client.send(new ListTablesCommand({}));
    const tableExists = listTablesResponse.TableNames?.includes(getTableName("APPOINTMENTS"));

    if (!tableExists) {
      // Create table if it doesn't exist
      await client.send(new CreateTableCommand({
        TableName: getTableName("APPOINTMENTS"),
        AttributeDefinitions: [
          { AttributeName: "id", AttributeType: "S" },
          { AttributeName: "userid", AttributeType: "S" },
          { AttributeName: "startTime", AttributeType: "S" },
        ],
        KeySchema: [
          { AttributeName: "id", KeyType: "HASH" },  // Partition key
        ],
        GlobalSecondaryIndexes: [
          {
            IndexName: "PatientAppointments",
            KeySchema: [
              { AttributeName: "userid", KeyType: "HASH" },
              { AttributeName: "startTime", KeyType: "RANGE" }
            ],
            Projection: {
              ProjectionType: "ALL"
            },
            ProvisionedThroughput: {
              ReadCapacityUnits: 5,
              WriteCapacityUnits: 5
            }
          }
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }));

      // Wait for table to be active
      let tableActive = false;
      while (!tableActive) {
        const describeTableResponse = await client.send(new DescribeTableCommand({
          TableName: getTableName("APPOINTMENTS")
        }));
        if (describeTableResponse.Table?.TableStatus === 'ACTIVE') {
          tableActive = true;
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    tableInitialized = true;
  } catch (error) {
    console.error("Error ensuring appointments table:", error);
    throw error;
  }
}

export interface Appointment {
  id: string;
  userid: string;
  programName: string;
  address: string;
  startTime: string;
  status: 'going' | 'not-going' | 'scheduled';
  notes?: string;
  isUrgent: boolean;
  eventFrom: string;
  contactNo?: string;
  createdAt: string;
  updatedAt: string;
}

export async function createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) {
  const now = new Date().toISOString();
  const id = `appt_${Date.now()}`;

  const newAppointment: Appointment = {
    ...appointment,
    id,
    createdAt: now,
    updatedAt: now,
  };

  await dynamoDb.send(new PutCommand({
    TableName: getTableName("APPOINTMENTS"),
    Item: newAppointment,
  }));

  return newAppointment;
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  const result = await dynamoDb.send(new GetCommand({
    TableName: getTableName("APPOINTMENTS"),
    Key: { id }
  }));

  return result.Item as Appointment || null;
}

export async function getAppointmentsByPatient(): Promise<Appointment[]> {
  try {
    // Use scan to get all appointments since we might have appointments without patientId
    const result = await dynamoDb.send(new ScanCommand({
      TableName: getTableName("APPOINTMENTS")
    }));

    // Filter appointments after fetching
    const appointments = result.Items || [];

    // Return all appointments for now since patientId might be missing
    return appointments as Appointment[];
  } catch (error) {
    console.error("Error getting appointments:", error);
    return [];
  }
}

export async function updateAppointment(
  id: string, 
  updates: Partial<Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Appointment | null> {
  try {
    const now = new Date().toISOString();
    
    // Build update expression and attributes
    const updateParts: string[] = [];
    const expressionAttributeValues: Record<string, string | boolean | number> = {};
    const expressionAttributeNames: Record<string, string> = {};

    // Add updatedAt
    updateParts.push('#ua = :ua');
    expressionAttributeNames['#ua'] = 'updatedAt';
    expressionAttributeValues[':ua'] = now;

    Object.entries(updates).forEach(([key, value]) => {
      // Only include the field if it's not undefined
      if (value !== undefined) {
        const nameKey = `#${key}`;
        const valueKey = `:${key}`;
        updateParts.push(`${nameKey} = ${valueKey}`);
        expressionAttributeNames[nameKey] = key;
        expressionAttributeValues[valueKey] = value;
      }
    });

    const updateExpression = 'SET ' + updateParts.join(', ');

    const result = await dynamoDb.send(new UpdateCommand({
      TableName: getTableName("APPOINTMENTS"),
      Key: { id },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: "ALL_NEW"
    }));

    return result.Attributes as Appointment || null;
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
}

export async function deleteAppointment(id: string): Promise<void> {
  await dynamoDb.send(new DeleteCommand({
    TableName: getTableName("APPOINTMENTS"),
    Key: { id }
  }));
}
