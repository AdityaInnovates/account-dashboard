const mongoose = require("mongoose");

const authschema = mongoose.Schema({
  email: { type: String, unique: true },
  otp: { type: Number },
  totalTries: {
    type: Object,
  },
});
module.exports =
  mongoose.models["2FA_SYSTEMS"] || mongoose.model("2FA_SYSTEMS", authschema);
