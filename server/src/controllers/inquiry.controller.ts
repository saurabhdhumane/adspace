import { Response } from 'express';
import { Inquiry } from '../models/Inquiry.js';
import { Banner } from '../models/Banner.js';
import { User } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';
import { publishNotificationEvent } from '../services/sns.service.js';

export const createInquiry = async (req: AuthRequest, res: Response) => {
  try {
    const advertiserId = req.user!._id;
    const { bannerId, requestedRange, message } = req.body;

    const banner = await Banner.findById(bannerId);
    if (!banner || !banner.isActive) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Banner listing not found' },
      });
    }

    const inquiry = new Inquiry({
      bannerId: banner._id,
      advertiserId,
      ownerId: banner.ownerId,
      requestedRange: {
        from: new Date(requestedRange.from),
        to: new Date(requestedRange.to),
      },
      message,
      status: 'pending',
    });

    await inquiry.save();

    // Trigger notification to owner
    const owner = await User.findById(banner.ownerId);
    if (owner) {
      await publishNotificationEvent({
        eventType: 'INQUIRY_CREATED',
        recipientId: owner._id.toString(),
        recipientPushToken: owner.expoPushToken,
        title: 'New Banner Inquiry',
        body: `${req.user!.name} requested to book "${banner.title}"`,
        data: { inquiryId: inquiry._id.toString(), bannerId: banner._id.toString() },
      });
    }

    return res.status(201).json({
      success: true,
      data: inquiry.toJSON(),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'CREATE_INQUIRY_ERROR', message: error.message },
    });
  }
};

export const getSentInquiries = async (req: AuthRequest, res: Response) => {
  try {
    const advertiserId = req.user!._id;

    const inquiries = await Inquiry.find({ advertiserId })
      .sort({ createdAt: -1 })
      .populate('bannerId')
      .populate('ownerId', 'name email company phone avatarUrl');

    return res.json({
      success: true,
      data: inquiries,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'GET_SENT_INQUIRIES_ERROR', message: error.message },
    });
  }
};

export const getReceivedInquiries = async (req: AuthRequest, res: Response) => {
  try {
    const ownerId = req.user!._id;

    const inquiries = await Inquiry.find({ ownerId })
      .sort({ createdAt: -1 })
      .populate('bannerId')
      .populate('advertiserId', 'name email company phone avatarUrl');

    return res.json({
      success: true,
      data: inquiries,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'GET_RECEIVED_INQUIRIES_ERROR', message: error.message },
    });
  }
};

export const respondToInquiry = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, ownerResponse } = req.body;
    const ownerId = req.user!._id;

    const inquiry = await Inquiry.findOne({ _id: id, ownerId });
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Inquiry not found or unauthorized' },
      });
    }

    inquiry.status = status;
    if (ownerResponse) {
      inquiry.ownerResponse = ownerResponse;
    }
    await inquiry.save();

    // If accepted, add booked slot to Banner and recompute status
    if (status === 'accepted') {
      const banner = await Banner.findById(inquiry.bannerId);
      if (banner) {
        banner.bookedSlots.push({
          from: inquiry.requestedRange.from,
          to: inquiry.requestedRange.to,
          note: `Inquiry by ${req.user!.name}`,
        });
        banner.recomputeStatus();
        await banner.save();
      }
    }

    // Trigger notification to advertiser
    const advertiser = await User.findById(inquiry.advertiserId);
    if (advertiser) {
      await publishNotificationEvent({
        eventType: 'INQUIRY_RESPONDED',
        recipientId: advertiser._id.toString(),
        recipientPushToken: advertiser.expoPushToken,
        title: `Inquiry ${status.toUpperCase()}`,
        body: `Owner responded to your inquiry: status is ${status}`,
        data: { inquiryId: inquiry._id.toString(), bannerId: inquiry.bannerId.toString() },
      });
    }

    return res.json({
      success: true,
      data: inquiry.toJSON(),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'RESPOND_INQUIRY_ERROR', message: error.message },
    });
  }
};
