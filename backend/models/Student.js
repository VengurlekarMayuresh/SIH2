const mongoose = require("mongoose");
const validate = require("validator");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution", // References the Institution model
      required: false, // Made optional for independent student registrations
    },
    email: {
      type: String,
      lowercase: true,
      required: true,
      validate(value) {
        if (!validate.isEmail(value)) {
          throw new Error("Invalid Email");
        }
      },
    },
    password: { // The password field is still here, but without a pre-save hook
      type: String,
      required: true,
      validate(value) {
        if (!validate.isStrongPassword(value)) {
          throw new Error("Password is not strong enough");
        }
      },
    },
    rollNo: {
      type: String,
      required: false, // Optional for independent students
    },
    division: {
      type: String,
      required: false, // Optional for independent students
    },
    year: {
      type: String,
      default: new Date().getFullYear().toString(),
    },
    class: {
      type: String,
      required: false, // Optional for independent students
    },
    phone: {
      type: String,
      validate(value) {
        if (value && !validate.isMobilePhone(value, "en-IN")) {
          throw new Error("Invalid Phone Number");
        }
      },
    },
    parentPhone: {
      type: String,
      validate(value) {
        if (value && !validate.isMobilePhone(value, "en-IN")) {
          throw new Error("Invalid Phone Number");
        }
      },
    },
    virtualDrillsCompleted: [{
      drillId: {
        type: String,
        required: true
      },
      drillType: {
        type: String,
        required: true
      },
      score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
      },
      passed: {
        type: Boolean,
        required: true
      },
      completedAt: {
        type: Date,
        default: Date.now
      },
      attempts: {
        type: Number,
        default: 1
      }
    }],
  },
  {
    timestamps: true,
  }
);

// Compound indexes for multi-institution support
// Partial indexes to handle optional institutionId
studentSchema.index(
  { institutionId: 1, email: 1 }, 
  { 
    unique: true,
    partialFilterExpression: { institutionId: { $exists: true } }
  }
);
studentSchema.index(
  { institutionId: 1, rollNo: 1 }, 
  { 
    unique: true,
    partialFilterExpression: { institutionId: { $exists: true } }
  }
);
// Separate index for independent students
studentSchema.index(
  { email: 1 }, 
  { 
    unique: true,
    partialFilterExpression: { institutionId: { $exists: false } }
  }
);

const Student = mongoose.model("Student", studentSchema);
module.exports = Student;