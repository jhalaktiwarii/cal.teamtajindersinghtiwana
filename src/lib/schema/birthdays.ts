import { CreateTableCommand, DynamoDBClient, ListTablesCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "../dynamodb";
import type { Birthday } from "@/app/types/birthday";
import { getTableName, getTableConfig } from "./constants";

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
    const tableExists = listTablesResponse.TableNames?.includes(getTableName("BIRTHDAYS"));
    if (!tableExists) {
      await client.send(new CreateTableCommand({
        TableName: getTableName("BIRTHDAYS"),
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
        const describeTableResponse = await client.send(new DescribeTableCommand({ TableName: getTableName("BIRTHDAYS") }));
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

// Function to find existing birthday by name and date
export async function findBirthdayByNameAndDate(fullName: string, day: number, month: number, year?: number): Promise<Birthday | null> {
  await ensureBirthdaysTable();
  
  let filterExpression: string;
  let expressionAttributeNames: Record<string, string>;
  let expressionAttributeValues: Record<string, string | number>;

  if (year !== undefined) {
    // If year is provided, check for exact match including year
    filterExpression = '#name = :name AND #day = :day AND #month = :month AND #year = :year';
    expressionAttributeNames = {
      '#name': 'fullName',
      '#day': 'day',
      '#month': 'month',
      '#year': 'year'
    };
    expressionAttributeValues = {
      ':name': fullName,
      ':day': day,
      ':month': month,
      ':year': year
    };
  } else {
    // If no year provided, check for match without year (name, day, month only)
    filterExpression = '#name = :name AND #day = :day AND #month = :month';
    expressionAttributeNames = {
      '#name': 'fullName',
      '#day': 'day',
      '#month': 'month'
    };
    expressionAttributeValues = {
      ':name': fullName,
      ':day': day,
      ':month': month
    };
  }

  const result = await dynamoDb.send(new ScanCommand({ 
    TableName: getTableName("BIRTHDAYS"),
    FilterExpression: filterExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues
  }));
  
  return result.Items && result.Items.length > 0 ? result.Items[0] as Birthday : null;
}

export async function createBirthday(birthday: Omit<Birthday, 'id'>): Promise<{ birthday: Birthday; wasReplaced: boolean }> {
  await ensureBirthdaysTable();
  
  // Check for existing birthday with same name and date
  const existingBirthday = await findBirthdayByNameAndDate(
    birthday.fullName, 
    birthday.day, 
    birthday.month, 
    birthday.year
  );
  
  if (existingBirthday) {
    // Update existing birthday with new data (replace it)
    const updatedBirthday: Birthday = {
      ...existingBirthday,
      ...birthday,
      id: existingBirthday.id // Keep the same ID
    };
    
    await dynamoDb.send(new PutCommand({ 
      TableName: getTableName("BIRTHDAYS"), 
      Item: updatedBirthday 
    }));
    
    return { birthday: updatedBirthday, wasReplaced: true };
  } else {
    // Create new birthday
    const id = `bday_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newBirthday: Birthday = { id, ...birthday };
    await dynamoDb.send(new PutCommand({ TableName: getTableName("BIRTHDAYS"), Item: newBirthday }));
    return { birthday: newBirthday, wasReplaced: false };
  }
}

export async function getBirthdays(): Promise<Birthday[]> {
  await ensureBirthdaysTable();
  const result = await dynamoDb.send(new ScanCommand({ TableName: getTableName("BIRTHDAYS") }));
  return (result.Items as Birthday[]) || [];
}

export async function updateBirthday(id: string, updates: Partial<Birthday>): Promise<Birthday | null> {
  await ensureBirthdaysTable();
  const getResult = await dynamoDb.send(new GetCommand({ TableName: getTableName("BIRTHDAYS"), Key: { id } }));
  if (!getResult.Item) return null;
  const updated = { ...getResult.Item, ...updates };
  await dynamoDb.send(new PutCommand({ TableName: getTableName("BIRTHDAYS"), Item: updated }));
  return updated as Birthday;
}

export async function deleteBirthday(id: string): Promise<void> {
  await ensureBirthdaysTable();
  await dynamoDb.send(new DeleteCommand({ TableName: getTableName("BIRTHDAYS"), Key: { id } }));
} 