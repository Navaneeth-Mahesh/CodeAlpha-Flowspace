import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const AVATAR_COLORS = ["#5B8DEF", "#F0B84B", "#3ECF8E", "#FF6B6B", "#9B8CFB", "#4FD1C5", "#F2789F"];

function getInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Name is required"], trim: true, maxlength: 80 },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    avatarInitials: { type: String },
    avatarColor: { type: String },
    bio: { type: String, maxlength: 280, default: "" },
    role: {
      type: String,
      enum: ["owner", "admin", "manager", "member", "guest"],
      default: "owner",
    },
    jobTitle: { type: String, default: "" },
    teamSize: { type: String, default: "" },
    timezone: { type: String, default: "UTC" },
    onboarded: { type: Boolean, default: false },
    notificationPrefs: {
      taskAssigned: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true },
      deadlines: { type: Boolean, default: true },
    },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.avatarInitials) this.avatarInitials = getInitials(this.name);
  if (!this.avatarColor) this.avatarColor = getAvatarColor(this.email);

  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatarInitials: this.avatarInitials,
    avatarColor: this.avatarColor,
    bio: this.bio,
    role: this.role,
    jobTitle: this.jobTitle,
    teamSize: this.teamSize,
    timezone: this.timezone,
    onboarded: this.onboarded,
    notificationPrefs: this.notificationPrefs,
    createdAt: this.createdAt,
  };
};

export default mongoose.model("User", userSchema);
