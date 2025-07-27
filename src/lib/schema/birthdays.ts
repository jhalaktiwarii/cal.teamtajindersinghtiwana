import { CreateTableCommand, DynamoDBClient, ListTablesCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "../dynamodb";
import type { Birthday } from "@/app/types/birthday";

let tableInitialized = false;

export async function ensureBirthdaysTable() {
  if (tableInitialized) return;
  const client = new DynamoDBClient({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    region: process.env.AWS_REGION,
  });
  try {
    const listTablesResponse = await client.send(new ListTablesCommand({}));
    const tableExists = listTablesResponse.TableNames?.includes('Birthdays');
    if (!tableExists) {
      await client.send(new CreateTableCommand({
        TableName: 'Birthdays',
        AttributeDefinitions: [
          { AttributeName: "id", AttributeType: "S" },
        ],
        KeySchema: [
          { AttributeName: "id", KeyType: "HASH" },
        ],
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }));
      let tableActive = false;
      while (!tableActive) {
        const describeTableResponse = await client.send(new DescribeTableCommand({ TableName: 'Birthdays' }));
        if (describeTableResponse.Table?.TableStatus === 'ACTIVE') {
          tableActive = true;
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    tableInitialized = true;
  } catch (error) {
    console.error("Error ensuring birthdays table:", error);
    throw error;
  }
}

export async function createBirthday(birthday: Omit<Birthday, 'id'>) {
  await ensureBirthdaysTable();
  const id = `bday_${Date.now()}`;
  const newBirthday: Birthday = { id, ...birthday };
  await dynamoDb.send(new PutCommand({ TableName: 'Birthdays', Item: newBirthday }));
  return newBirthday;
}

export async function getBirthdays(): Promise<Birthday[]> {
  await ensureBirthdaysTable();
  const result = await dynamoDb.send(new ScanCommand({ TableName: 'Birthdays' }));
  return (result.Items as Birthday[]) || [];
}

export async function updateBirthday(id: string, updates: Partial<Birthday>): Promise<Birthday | null> {
  await ensureBirthdaysTable();
  const getResult = await dynamoDb.send(new GetCommand({ TableName: 'Birthdays', Key: { id } }));
  if (!getResult.Item) return null;
  const updated = { ...getResult.Item, ...updates };
  await dynamoDb.send(new PutCommand({ TableName: 'Birthdays', Item: updated }));
  return updated as Birthday;
}

export async function deleteBirthday(id: string): Promise<void> {
  await ensureBirthdaysTable();
  await dynamoDb.send(new DeleteCommand({ TableName: 'Birthdays', Key: { id } }));
} 