import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { env } from '../config/env.js';

let snsClient: SNSClient | null = null;

if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
  snsClient = new SNSClient({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

export const publishNotificationEvent = async (event: {
  eventType: 'INQUIRY_CREATED' | 'INQUIRY_RESPONDED';
  recipientId: string;
  recipientPushToken?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}): Promise<void> => {
  console.log(`[Notification Service] Triggering event: ${event.eventType} for User: ${event.recipientId}`);

  if (!snsClient || !env.SNS_TOPIC_ARN) {
    console.log('[Notification Service] AWS SNS not configured. Simulated notification:', event);
    return;
  }

  try {
    const command = new PublishCommand({
      TopicArn: env.SNS_TOPIC_ARN,
      Subject: event.title,
      Message: JSON.stringify(event),
    });
    await snsClient.send(command);
  } catch (error) {
    console.error('[Notification Service] Error publishing to SNS:', error);
  }
};
