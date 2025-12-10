import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        trim: true,
        match: [
            /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
            'Please enter a valid email'
        ]
    },
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    password: {
        type: String,
        required: false
    },
    firebaseUid: {
        type: String,
        unique: true,
        sparse: true
    },
    photoURL: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

    // Video Conferencing Specific Fields
    recentMeetings: [
        {
            meetingId: { type: String, required: true },
            joinedAt: { type: Date, default: Date.now },
            duration: { type: Number, default: 0 } // in minutes
        }
    ],
    contacts: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            addedAt: { type: Date, default: Date.now }
        }
    ],
    meetingPreferences: {
        micMuted: { type: Boolean, default: true },
        cameraOn: { type: Boolean, default: false },
        preferredLayout: {
            type: String,
            enum: ['grid', 'speaker'],
            default: 'grid'
        },
        virtualBackground: { type: String, default: '' }
    },

    // Analytics & Activity
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    totalMeetingsHosted: {
        type: Number,
        default: 0
    },
    totalMeetingsJoined: {
        type: Number,
        default: 0
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, {
    timestamps: true
});

// // Indexes for better querying
// userSchema.index({ email: 1 });

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

// Generate and set password reset token
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Token valid for 15 minutes by default
    this.resetPasswordExpire = Date.now() + (process.env.RESET_TOKEN_EXPIRE_MIN || 15) * 60 * 1000;

    return resetToken;
};

const User = mongoose.model('User', userSchema);

export default User;
