const mongoose = require("mongoose");
const validate = require("validator");

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    institutionId: {
      type: String, // The human-readable ID
      required: true,
      unique: true,
    },
    email: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      validate(value) {
        if (!validate.isEmail(value)) {
          throw new Error("Invalid Email");
        }
      },
    },
    password: { // The password field is still here, but without the pre-save hook
      type: String,
      required: true,
      validate(value) {
        if (!validate.isStrongPassword(value, { minLength: 6, minLowercase: 1 })) {
          throw new Error("Password is not strong enough");
        }
      },
    },
    phone: {
      type: String,
      required: true,
      validate(value) {
        if (!validate.isMobilePhone(value, "en-IN")) {
          throw new Error("Invalid Phone Number");
        }
      },
    },
    location: {
      state: { type: String, required: true },
      district: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      address: { type: String, required: true },
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const Institution = mongoose.model("Institution", institutionSchema);
module.exports = Institution;