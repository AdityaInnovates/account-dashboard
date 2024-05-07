const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const authschema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  Isbanned: {
    type: Boolean,
    default: false,
  },
  totalTries: {
    type: Object,
    required: true,
    default: { tries: 0, date: "03/07/2023" },
  },
  activities: {
    type: Array,
    required: true,
  },
  ExpiredTokens: {
    type: Array,
    required: false,
  },
});
authschema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

module.exports = mongoose.models?.users || mongoose.model("users", authschema);
