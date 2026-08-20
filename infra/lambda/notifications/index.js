const https = require('https');

/**
 * AWS Lambda handler subscribed to SNS Topic.
 * Dispatches Expo Push Notifications to registered device tokens.
 */
exports.handler = async (event) => {
  console.log('Notification Dispatcher triggered with event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    try {
      const snsPayload = JSON.parse(record.Sns.Message);
      const { recipientPushToken, title, body, data } = snsPayload;

      if (!recipientPushToken || !recipientPushToken.startsWith('ExponentPushToken')) {
        console.log(`Skipping notification for invalid or missing push token: ${recipientPushToken}`);
        continue;
      }

      const messagePayload = JSON.stringify({
        to: recipientPushToken,
        sound: 'default',
        title,
        body,
        data: data || {},
      });

      console.log(`Sending Expo Push Notification to: ${recipientPushToken}`);

      await new Promise((resolve, reject) => {
        const req = https.request(
          'https://exp.host/--/api/v2/push/send',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(messagePayload),
            },
          },
          (res) => {
            let resData = '';
            res.on('data', (chunk) => (resData += chunk));
            res.on('end', () => {
              console.log('Expo Push Response:', resData);
              resolve(resData);
            });
          }
        );

        req.on('error', (err) => {
          console.error('Push HTTP Error:', err);
          reject(err);
        });

        req.write(messagePayload);
        req.end();
      });
    } catch (err) {
      console.error('Error processing SNS record:', err);
    }
  }

  return { statusCode: 200, body: 'Notification dispatch complete' };
};
