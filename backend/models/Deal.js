import mongoose from 'mongoose';

const dealSchema = new mongoose.Schema({
  restaurantOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  restaurantName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  dealPrice: {
    type: Number,
    required: true,
    min: 0
  },
  // NEW: Image Field
  image: {
    fileName: String,
    filePath: String,
    fileType: String
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true
});

export default mongoose.model('Deal', dealSchema);