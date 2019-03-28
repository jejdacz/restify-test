require("dotenv").config();
const errors = require("restify-errors");
const restjwt = require("restify-jwt-community");
const Customer = require("../models/Customer");

module.exports = app => {
  // get customers
  app.get("/customers", async (req, res, next) => {
    try {
      const customers = await Customer.find({});
      res.send(customers);
      next();
    } catch (err) {
      next(new errors.InvalidContentError(err));
    }
  });

  //get customer
  app.get("/customers/:id", async (req, res, next) => {
    try {
      const customer = await Customer.findById(req.params.id);
      res.send(customer);
      next();
    } catch (err) {
      next(
        new errors.ResourceNotFoundError(
          `Customer id:${req.params.id} doesn't exist`
        )
      );
    }
  });

  // add customer
  app.post(
    "/customers",
    restjwt({ secret: process.env.JWT_SECRET }),
    async (req, res, next) => {
      // check JSON content type
      if (!req.is("application/json")) {
        next(new errors.InvalidContentError("Expects 'application/json'"));
      }

      const { name, email, balance } = req.body;
      const customer = new Customer({ name, email, balance });

      try {
        const newCustomer = await customer.save();
        res.send(201, newCustomer);
        next();
      } catch (err) {
        next(new errors.InternalError(err.message));
      }
    }
  );

  //update customer
  app.put(
    "/customers/:id",
    restjwt({ secret: process.env.JWT_SECRET }),
    async (req, res, next) => {
      if (!req.is("application/json")) {
        next(new errors.InvalidContentError("Expexts 'application/json"));
      }

      try {
        const updatedCustomer = await Customer.findOneAndUpdate(
          { _id: req.params.id },
          req.body
        );
        res.send(200);
        next();
      } catch (err) {
        next(
          new errors.ResourceNotFoundError(
            `Customer id:${req.params.id} doesn't exist`
          )
        );
      }
    }
  );

  // delete customer
  app.del(
    "/customers/:id",
    restjwt({ secret: process.env.JWT_SECRET }),
    async (req, res, next) => {
      try {
        const deletedCustomer = await Customer.findByIdAndRemove(req.params.id);
        res.send(204);
        next();
      } catch (err) {
        next(
          new errors.ResourceNotFoundError(
            `Customer id:${req.params.id} doesn't exist`
          )
        );
      }
    }
  );
};
