import mongoose, { Document, Schema } from 'mongoose';

export interface IBannerDocument extends Document {
  ownerId: mongoose.Types.ObjectId;
  title: string;
  type: 'bus_stand' | 'hoarding' | 'flyover_gantry' | 'unipole' | 'wall';
  description?: string;
  photos: Array<{
    url: string;
    thumbnailUrl?: string;
    isPrimary: boolean;
  }>;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
    address: string;
    city: string;
    state?: string;
    landmark?: string;
  };
  dimensions: {
    width: number;
    height: number;
    unit: 'ft' | 'm';
  };
  illumination: 'lit' | 'non_lit';
  trafficNotes?: string;
  price: {
    amount: number;
    currency: 'INR';
    per: 'day' | 'week' | 'month';
  };
  status: 'available' | 'busy';
  bookedSlots: Array<{
    _id?: mongoose.Types.ObjectId;
    from: Date;
    to: Date;
    note?: string;
  }>;
  isActive: boolean;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  recomputeStatus(): 'available' | 'busy';
}

const bannerSchema = new Schema<IBannerDocument>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['bus_stand', 'hoarding', 'flyover_gantry', 'unipole', 'wall'],
      required: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    photos: [
      {
        url: { type: String, required: true },
        thumbnailUrl: { type: String },
        isPrimary: { type: Boolean, default: false },
      },
    ],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true,
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
      address: { type: String, required: true },
      city: { type: String, required: true, index: true },
      state: { type: String },
      landmark: { type: String },
    },
    dimensions: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      unit: { type: String, enum: ['ft', 'm'], default: 'ft' },
    },
    illumination: {
      type: String,
      enum: ['lit', 'non_lit'],
      required: true,
    },
    trafficNotes: {
      type: String,
    },
    price: {
      amount: { type: Number, required: true, index: true },
      currency: { type: String, enum: ['INR'], default: 'INR' },
      per: { type: String, enum: ['day', 'week', 'month'], default: 'month' },
    },
    status: {
      type: String,
      enum: ['available', 'busy'],
      default: 'available',
      index: true,
    },
    bookedSlots: [
      {
        from: { type: Date, required: true },
        to: { type: Date, required: true },
        note: { type: String },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

// 2dsphere index for location
bannerSchema.index({ location: '2dsphere' });

// Compute banner status dynamically based on bookedSlots
bannerSchema.methods.recomputeStatus = function (): 'available' | 'busy' {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isBusy = (this.bookedSlots || []).some((slot: { from: Date; to: Date }) => {
    const fromDate = new Date(slot.from);
    const toDate = new Date(slot.to);
    fromDate.setHours(0, 0, 0, 0);
    toDate.setHours(23, 59, 59, 999);
    return today >= fromDate && today <= toDate;
  });

  this.status = isBusy ? 'busy' : 'available';
  return this.status;
};

// Pre-save middleware to auto-recompute status
bannerSchema.pre('save', function (next) {
  this.recomputeStatus();
  next();
});

export const Banner = mongoose.model<IBannerDocument>('Banner', bannerSchema);
