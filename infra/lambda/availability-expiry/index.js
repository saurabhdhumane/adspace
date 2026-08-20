const mongoose = require('mongoose');

/**
 * AWS Lambda handler triggered by EventBridge hourly cron.
 * Flips busy banners back to available when their booked date ranges have passed.
 */
exports.handler = async () => {
  console.log('Running Availability Expiry Cron Job...');
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error('MONGODB_URI environment variable missing.');
    return { statusCode: 500, body: 'Missing MONGODB_URI' };
  }

  try {
    await mongoose.connect(mongoUri);
    
    const bannerSchema = new mongoose.Schema({
      status: String,
      bookedSlots: [{ from: Date, to: Date }]
    });
    const Banner = mongoose.model('Banner', bannerSchema);

    const busyBanners = await Banner.find({ status: 'busy' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let updatedCount = 0;

    for (const banner of busyBanners) {
      const isStillBusy = (banner.bookedSlots || []).some(slot => {
        const fromDate = new Date(slot.from);
        const toDate = new Date(slot.to);
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
        return today >= fromDate && today <= toDate;
      });

      if (!isStillBusy) {
        banner.status = 'available';
        await banner.save();
        updatedCount++;
      }
    }

    console.log(`Availability Expiry Job complete. Flipped ${updatedCount} banners to available.`);
    return { statusCode: 200, body: `Flipped ${updatedCount} banners to available` };
  } catch (error) {
    console.error('Availability Expiry Error:', error);
    return { statusCode: 500, body: error.message };
  } finally {
    await mongoose.disconnect();
  }
};
