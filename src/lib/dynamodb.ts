import { DynamoDBClient, DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const config: DynamoDBClientConfig = {
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'dummy',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'dummy',
  },
  region: process.env.AWS_REGION || 'us-east-1'
};

if (process.env.DYNAMODB_ENDPOINT) {
  config.endpoint = process.env.DYNAMODB_ENDPOINT;
}

const client = new DynamoDBClient(config);

export const dynamoDb = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

// Add error handling for missing AWS configuration
export const isAwsConfigured = () => {
  return process.env.AWS_ACCESS_KEY_ID && 
         process.env.AWS_SECRET_ACCESS_KEY && 
         process.env.AWS_REGION;
};
