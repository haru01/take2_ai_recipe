import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  recipeId: string;
  reasons: string[];
  comment?: string;
  futureInterest: 'interested' | 'notInterested' | 'requestChange';
  rating?: number;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>({
  recipeId: { 
    type: String, 
    required: true,
    index: true,
  },
  reasons: [{
    type: String,
    required: true,
  }],
  comment: {
    type: String,
    maxlength: 1000,
  },
  futureInterest: {
    type: String,
    enum: ['interested', 'notInterested', 'requestChange'],
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  userAgent: { type: String },
  ipAddress: { type: String },
}, {
  timestamps: true,
});

FeedbackSchema.index({ recipeId: 1, createdAt: -1 });

export const Feedback = mongoose.model<IFeedback>('Feedback', FeedbackSchema);