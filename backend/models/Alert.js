const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    type: {
      type: String,
      enum: ["emergency", "warning", "info", "maintenance"],
      default: "info"
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    expiresAt: {
      type: Date,
      default: null // null means no expiration
    },
    targetAudience: {
      type: String,
      enum: ["all", "students", "specific_class"],
      default: "all"
    },
    targetClass: {
      type: String,
      required: false // Only required when targetAudience is "specific_class"
    },
    targetDivision: {
      type: String,
      required: false // Optional for more specific targeting
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
alertSchema.index({ institutionId: 1, isActive: 1, createdAt: -1 });
alertSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired alerts

// Method to check if alert is expired
alertSchema.methods.isExpired = function() {
  return this.expiresAt && this.expiresAt < new Date();
};

// Static method to get active alerts for an institution
alertSchema.statics.getActiveAlerts = function(institutionId, targetAudience = "all", targetClass = null) {
  const query = {
    institutionId,
    isActive: true,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  };

  // Filter by target audience
  if (targetAudience !== "all") {
    query.$and = [
      {
        $or: [
          { targetAudience: "all" },
          { targetAudience: targetAudience }
        ]
      }
    ];

    if (targetClass && targetAudience === "specific_class") {
      query.targetClass = targetClass;
    }
  }

  return this.find(query)
    .sort({ priority: -1, createdAt: -1 })
    .populate("createdBy", "name institutionId");
};

const Alert = mongoose.model("Alert", alertSchema);
module.exports = Alert;