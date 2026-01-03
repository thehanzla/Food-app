import mongoose from 'mongoose';

const restaurantRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  cuisine: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  famousFor: {
    type: String,
    required: true
  },
  document: {
    fileName: String,
    filePath: String,
    fileType: String
  },
  image: {
    fileName: String,
    filePath: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date
});

const RestaurantRequest = mongoose.model('RestaurantRequest', restaurantRequestSchema);
export default RestaurantRequest;