# AWS Lambda Functions for AdSpace

This directory contains serverless AWS Lambda function handlers for asynchronous backend automation:

1. **`image-pipeline`**: Automatically triggered by S3 `ObjectCreated` events when space owners upload banner photos. Generates thumbnail previews and updates MongoDB document references.
2. **`availability-expiry`**: Hourly EventBridge cron job that scans all banners with `status: 'busy'` and auto-flips them to `status: 'available'` when their booked slot date ranges have passed.
3. **`notifications`**: Subscribed to the SNS Topic (`SNS_TOPIC_ARN`). Dispatches push notifications to the Expo Push API (`https://exp.host/--/api/v2/push/send`) whenever new inquiries are created or responded to.

## Deployment Notes (AWS CLI / Zip)

```bash
# Packaging Lambda functions
cd infra/lambda/image-pipeline && zip -r ../image-pipeline.zip .
cd ../availability-expiry && zip -r ../availability-expiry.zip .
cd ../notifications && zip -r ../notifications.zip .

# Creating Lambda via AWS CLI
aws lambda create-function \
  --function-name adspace-image-pipeline \
  --runtime nodejs20.x \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/LambdaExecutionRole \
  --handler index.handler \
  --zip-file fileb://infra/lambda/image-pipeline.zip
```
