require("dotenv").config();
const restify = require("restify");
const mongoose = require("mongoose");
const restjwt = require("restify-jwt-community");

const app = restify.createServer();

app.use(restify.plugins.bodyParser());

// Protect Routes
// server.use(rjwt({ secret: config.JWT_SECRET }).unless({ path: ['/auth'] }));

app.listen(process.env.PORT, () => {
  mongoose.set("useFindAndModify", false);
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
});

const db = mongoose.connection;
db.on("error", err => console.log(err));

db.once("open", () => {
  require("./routes/customers")(app);
  require("./routes/users")(app);
  console.log(`...app started on port ${process.env.PORT}`);
});
