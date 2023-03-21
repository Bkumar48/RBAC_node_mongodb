const mongoose = require("mongoose"); // Erase if already required
const bcrypt = require("bcrypt");
const createHttpError = require("http-errors");
// Declare the Schema of the Mongo model
const {roles} = require("../utils/constants");
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: [roles.admin, roles.moderator, roles.client],
    default: roles.client,
  },
},{
  virtuals:true,
});

UserSchema.pre('save', async function (next) {
  try {
    if (this.isNew) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(this.password, salt);
      this.password = hashedPassword;
    }
    next();
  } catch (error) {
    next(error);
  }
});


UserSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
    
  } catch (error) {
    throw createHttpError.InternalServerError(error.message);
  }
}
//Export the model
module.exports = mongoose.model("uzer", UserSchema);
// const Uzer = mongoose.model("uzer", UserSchema);
// module.exports = Uzer;