require("dotenv").config();
const errors = require("restify-errors");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../auth");

module.exports = app => {
  // register user
  app.post("/register", (req, res, next) => {
    const { email, password } = req.body;

    const user = new User({ email, password });

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, async (err, hash) => {
        user.password = hash;
        try {
          const newUser = await user.save();
          res.send(201);
          return next();
        } catch (err) {
          return next(new errors.InternalError(err.message));
        }
      });
    });
  });

  // auth user
  app.post("/auth", async (req, res, next) => {
    // check JSON content type
    if (!req.is("application/json")) {
      return next(new errors.InvalidContentError("Expects 'application/json'"));
    }

    const { email, password } = req.body;

    try {
      const user = await auth(email, password);
      // create JWT
      const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET, {
        expiresIn: "1y"
      });

      const { iat, exp } = jwt.decode(token);
      // respond with token
      res.send({ iat, exp, token });
      return next();
    } catch (err) {
      // unauthorized
      return next(new errors.UnauthorizedError(err));
    }
  });
};
