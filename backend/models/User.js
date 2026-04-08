const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      match: [/^[5-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['customer', 'provider', 'admin'],
      default: 'customer',
    },
    // Provider-specific fields
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE'],
      default: function () {
        return this.role === 'provider' ? 'PENDING' : 'ACTIVE';
      },
    },
    isFirstLogin: {
      type: Boolean,
      default: function () {
        return this.role === 'provider';
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    // Location (used by providers)
    currentLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      updatedAt: { type: Date, default: null },
    },
    // Security and 2FA
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorMethod: { type: String, enum: ['SMS', 'APP'], default: 'SMS' },
    twoFactorSecret: { type: String },
    backupCodes: [{ type: String }],

    // Virtual wallet balance (in paise/INR)
    walletBalance: {
      type: Number,
      default: 0,
    },
    // Temp password for provider onboarding
    tempPassword: {
      type: String,
      select: false,
    },
    // Profile picture
    avatar: {
      type: String,
      default: null,
    },
    // Provider ID document (Admin can view)
    idDocumentUrl: {
      type: String,
      default: null,
      select: false,
    },
    // Address
    address: {
      street: String,
      city: { type: String, default: 'Mumbai' },
      state: { type: String, default: 'Maharashtra' },
      pincode: String,
    },
    // Refresh token for auth
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: Provider profile
userSchema.virtual('providerProfile', {
  ref: 'ProviderProfile',
  localField: '_id',
  foreignField: 'userId',
  justOne: true,
});

// Pre-save: Hash password
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Method: Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Method: Get full name
userSchema.methods.toPublicProfile = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.tempPassword;
  delete obj.refreshToken;
  delete obj.idDocumentUrl;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
