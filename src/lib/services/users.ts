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
    console.log("Fetching user from DynamoDB:", phone);
    const result = await dynamoDb.send(
      new GetCommand({
        TableName: "Users",
        Key: {
          phone: phone,
        },
      })
    );

    if (!result.Item) {
      console.log("No user found with phone:", phone);
      return null;
    }

    console.log("User found:", { ...result.Item, password: "[REDACTED]" });
    return result.Item as User;
  } catch (error) {
    console.error("DynamoDB Error:", error);
    return null;
  }
}

export async function verifyUserCredentials(phone: string, password: string) {
  try {
    console.log("Verifying credentials for phone:", phone);
    const user = await getUserByPhone(phone);
    
    if (!user) {
      console.log("User not found in verification:", phone);
      return null;
    }

    console.log("Comparing passwords...");
    const { password: hashedPassword, ...userWithoutPassword } = user;

    const isValidPassword = await compare(password, hashedPassword);
    
    if (!isValidPassword) {
      console.log("Invalid password for user:", phone);
      return null;
    }

    console.log("Password verified successfully");

    return userWithoutPassword;
  } catch (error) {
    console.error("Verification Error:", error);
    return null;
  }
}
