const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
  email: {
    type: String,
    require: true,
    unique: true,
  },
});

UserSchema.plugin(passportLocalMongoose); // passportLocal plugin to UserSchema, That's why there is only an email.

module.exports = mongoose.model("User", UserSchema);
