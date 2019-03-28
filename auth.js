const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = mongoose.model("User");

module.exports = (email, password) => {
  return new Promise(async (resolve, reject) => {
    try {
      // get user by email
      const user = await User.findOne({ email });

      // match password
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) throw err;
        if (!isMatch) throw "Password did not match";
        resolve(user);
      });
    } catch (err) {
      // email not found or password did not match
      reject("Authentication failed");
    }
  });
};
