import mongoose, { Document, Schema } from 'mongoose';

export interface IInquiryDocument extends Document {
  bannerId: mongoose.Types.ObjectId;
  advertiserId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  requestedRange: {
    from: Date;
    to: Date;
  };
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  ownerResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

const inquirySchema = new Schema<IInquiryDocument>(
  {
    bannerId: {
      type: Schema.Types.ObjectId,
      ref: 'Banner',
      required: true,
      index: true,
    },
    advertiserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    requestedRange: {
      from: { type: Date, required: true },
      to: { type: Date, required: true },
    },
    message: { type: String, trim: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending',
      index: true,
    },
    ownerResponse: { type: String, trim: true },
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

export const Inquiry = mongoose.model<IInquiryDocument>('Inquiry', inquirySchema);
