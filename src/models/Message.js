const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    ownerEmail: {
      type: String,
      required: true,
      trim: true,
    },
    ownerUsername: {
      type: String,
      required: true,
      trim: true,
    },
    templateType: {
      type: String,
      enum: [
        "BIRTHDAY",
        "CHRISTMAS",
        "NEW_YEAR",
        "VALENTINE",
        "ANNIVERSARY",
        "GRADUATION",
        "CUSTOM",
      ],
      required: true,
    },
    personalizedText: {
      type: String,
      required: true,
    },
    mediaUrls: [
      {
        type: String,
      },
    ],
    mediaType: [
      {
        type: String,
      },
    ],
    coinsSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    messageUrl: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    timesOpened: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Index for faster queries
messageSchema.index({ ownerUsername: 1 });
messageSchema.index({ messageUrl: 1 });
messageSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
