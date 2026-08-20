import { Request, Response } from 'express';
import { Banner } from '../models/Banner.js';
import { AuthRequest } from '../middleware/auth.js';

export const getBanners = async (req: Request, res: Response) => {
  try {
    const {
      city,
      type,
      minPrice,
      maxPrice,
      illumination,
      availableNow,
      sort,
      page = '1',
      limit = '20',
    } = req.query;

    const query: any = { isActive: true };

    if (city) {
      query['location.city'] = { $regex: new RegExp(`^${city}$`, 'i') };
    }
    if (type) {
      query.type = type;
    }
    if (illumination) {
      query.illumination = illumination;
    }
    if (minPrice || maxPrice) {
      query['price.amount'] = {};
      if (minPrice) query['price.amount'].$gte = Number(minPrice);
      if (maxPrice) query['price.amount'].$lte = Number(maxPrice);
    }
    if (availableNow === 'true') {
      query.status = 'available';
    }

    let sortOptions: any = { createdAt: -1 };
    if (sort === 'price_asc') sortOptions = { 'price.amount': 1 };
    if (sort === 'price_desc') sortOptions = { 'price.amount': -1 };
    if (sort === 'newest') sortOptions = { createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [banners, total] = await Promise.all([
      Banner.find(query).sort(sortOptions).skip(skip).limit(limitNum).populate('ownerId', 'name email company phone avatarUrl'),
      Banner.countDocuments(query),
    ]);

    // Recompute dynamic status for returned banners
    const processed = banners.map((b) => {
      b.recomputeStatus();
      return b.toJSON();
    });

    return res.json({
      success: true,
      data: processed,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'GET_BANNERS_ERROR', message: error.message },
    });
  }
};

export const getNearbyBanners = async (req: Request, res: Response) => {
  try {
    const { lng, lat, radiusKm = '20' } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_COORDINATES', message: 'Longitude (lng) and Latitude (lat) are required' },
      });
    }

    const longitude = parseFloat(lng as string);
    const latitude = parseFloat(lat as string);
    const radiusMeters = parseFloat(radiusKm as string) * 1000;

    const banners = await Banner.find({
      isActive: true,
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: radiusMeters,
        },
      },
    }).populate('ownerId', 'name email company phone avatarUrl');

    const processed = banners.map((b) => {
      b.recomputeStatus();
      return b.toJSON();
    });

    return res.json({
      success: true,
      data: processed,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'NEARBY_BANNERS_ERROR', message: error.message },
    });
  }
};

export const getBannerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id).populate('ownerId', 'name email company phone avatarUrl');
    if (!banner || !banner.isActive) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Banner listing not found' },
      });
    }

    // Increment view count
    banner.viewCount += 1;
    banner.recomputeStatus();
    await banner.save();

    return res.json({
      success: true,
      data: banner.toJSON(),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'GET_BANNER_ERROR', message: error.message },
    });
  }
};

export const createBanner = async (req: AuthRequest, res: Response) => {
  try {
    const ownerId = req.user!._id;

    const bannerData = {
      ...req.body,
      ownerId,
      viewCount: 0,
      isActive: true,
    };

    const banner = new Banner(bannerData);
    banner.recomputeStatus();
    await banner.save();

    return res.status(201).json({
      success: true,
      data: banner.toJSON(),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'CREATE_BANNER_ERROR', message: error.message },
    });
  }
};

export const updateBanner = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ownerId = req.user!._id;

    const banner = await Banner.findOne({ _id: id, ownerId });
    if (!banner) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Banner listing not found or unauthorized' },
      });
    }

    Object.assign(banner, req.body);
    banner.recomputeStatus();
    await banner.save();

    return res.json({
      success: true,
      data: banner.toJSON(),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'UPDATE_BANNER_ERROR', message: error.message },
    });
  }
};

export const deleteBanner = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const ownerId = req.user!._id;

    const banner = await Banner.findOne({ _id: id, ownerId });
    if (!banner) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Banner listing not found or unauthorized' },
      });
    }

    // Soft delete
    banner.isActive = false;
    await banner.save();

    return res.json({
      success: true,
      data: { id: banner._id.toString() },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'DELETE_BANNER_ERROR', message: error.message },
    });
  }
};

export const addBookedSlot = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { from, to, note } = req.body;
    const ownerId = req.user!._id;

    const banner = await Banner.findOne({ _id: id, ownerId });
    if (!banner) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Banner listing not found or unauthorized' },
      });
    }

    banner.bookedSlots.push({
      from: new Date(from),
      to: new Date(to),
      note,
    });

    banner.recomputeStatus();
    await banner.save();

    return res.json({
      success: true,
      data: banner.toJSON(),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'ADD_SLOT_ERROR', message: error.message },
    });
  }
};

export const deleteBookedSlot = async (req: AuthRequest, res: Response) => {
  try {
    const { id, slotId } = req.params;
    const ownerId = req.user!._id;

    const banner = await Banner.findOne({ _id: id, ownerId });
    if (!banner) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Banner listing not found or unauthorized' },
      });
    }

    banner.bookedSlots = banner.bookedSlots.filter(
      (slot) => slot._id?.toString() !== slotId
    );

    banner.recomputeStatus();
    await banner.save();

    return res.json({
      success: true,
      data: banner.toJSON(),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'DELETE_SLOT_ERROR', message: error.message },
    });
  }
};

export const getMyBanners = async (req: AuthRequest, res: Response) => {
  try {
    const ownerId = req.user!._id;

    const banners = await Banner.find({ ownerId, isActive: true }).sort({ createdAt: -1 });

    const processed = banners.map((b) => {
      b.recomputeStatus();
      return b.toJSON();
    });

    return res.json({
      success: true,
      data: processed,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'GET_MY_BANNERS_ERROR', message: error.message },
    });
  }
};
