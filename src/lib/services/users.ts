import { dynamoDb } from "../dynamodb";
import { GetCommand, } from "@aws-sdk/lib-dynamodb";
import { compare } from "bcrypt";

export interface User {
  phone: string;
  password: string;
  name: string;
  role: string;
  createdAt: string;
}

export async function getUserByPhone(phone: string): Promise<User | null> {
  try {
    const result = await dynamoDb.send(
      new GetCommand({
        TableName: "Users",
        Key: {
          phone: phone,
        },
      })
    );

    if (!result.Item) {
      return null;
    }

    return result.Item as User;
  } catch (error) {
    console.error("DynamoDB Error:", error);
    return null;
  }
}

export async function verifyUserCredentials(phone: string, password: string) {
  try {
    const user = await getUserByPhone(phone);
    
    if (!user) {
      return null;
    }

    const { password: hashedPassword, ...userWithoutPassword } = user;

    const isValidPassword = await compare(password, hashedPassword);
    
    if (!isValidPassword) {
      return null;
    }

    return userWithoutPassword;
  } catch (error) {
    console.error("Verification Error:", error);
    return null;
  }
}
