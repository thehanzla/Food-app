import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['customer', 'restaurant', 'admin'],
    default: 'customer'
  },
  // New Field for Email Verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  restaurantDetails: {
    businessName: String,
    cuisine: String,
    location: String,
    famousFor: String,
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationDocument: String,
    image: String, // Restaurant cover image
    discounts: {
      card: { type: Number, default: 0 },
      cash: { type: Number, default: 0 }
    }
  },
  favorites: [{
    itemId: { type: String, default: '' },
    title: { type: String, required: true },
    price: { type: Number, default: 0 },
    restaurant: { type: String, required: true },
    type: { type: String, default: 'deal' }, // Removed enum strictness
    description: { type: String, default: '' },
    image: { type: String, default: '' }, // Added image field just in case
    addedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);