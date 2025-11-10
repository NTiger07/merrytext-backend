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
        "MEMORY LANE SLIDESHOW",
        "FIREPLACE CHAT",
        "CONFETTI CANNON COUNTDOWN",
        "GRATITUDE JAR",
        "PERSONALIZED CAROL",
      ],
      required: true,
    },
    personalizedText: {
      type: String,
      required: true,
    },
    countdownDate: {
      type: Date,
      required: function () {
        return this.templateType === "CONFETTI CANNON COUNTDOWN";
      },
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
