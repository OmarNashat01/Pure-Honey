const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const mongostore = require("connect-mongodb-session")(session);
const app = express();

var cors = require("cors");
app.use(cors());

const port = process.env.PORT || 3000;
const productRoutes = require("./api/routes/products");
const offerRoutes = require("./api/routes/offers");
const orderRoutes = require("./api/routes/orders");
const userRoutes = require("./api/routes/user");
const categoryRoutes = require("./api/routes/category");
const { summary } = require("./api/controllers/orders");
const { adminAuth } = require("./api/middleware/check-auth");
require("dotenv").config();

mongoose.connect(process.env.NGO_URL_HOSTED);

mongoose.connection.on("connected", () => {
  console.log("mongodb connection established successfully");
});
mongoose.connection.on("error", () => {
  console.log("mongodb connection Failed");
});
/* const store = new mongostore({
  uri: process.env.NGO_URL_HOSTED,
  collection: "session",
}); */
// Log request data
//app.use(morgan("dev"));

// Setup static files path
//app.use("/uploads", express.static("uploads"));
//app.use("/", express.static("public"));

app.use(express.json());


app.use(cors());
//app.use(cookieParser());

// Use body parser middleware to parse body of incoming requests
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

/* app.use(
  session({
    name:"session",
    secret: process.env.JWT_KEY,
    resave: false,
    saveUninitialized: false,
    store,
    cookie:{
      sameSite:false
    }
  })
); */


/* app.use((req, res, next) => {
 
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
    next();
});  */

app.use((req, res, next) => {
/*   console.log({ body: req.body });
  console.log({ query: req.query });
  console.log({ params: req.params });
  console.log({ params: req.headers });
 */

  next();
});

// Routes which should handle requests
app.use("/api/products", productRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/summary", adminAuth, summary);

app.use("/test", (req, res) => {
  res.json({ message: "API IS WORKING..." });
});

app.use("/api/uploads*", (req, res, next) => {
  try {
    res.sendFile(__dirname + "/uploads" + req.params[0]);
  } catch (error) {
    next();
  }
});

/* app.use("/*", (req, res, next) => {
  try {
    res.sendFile(__dirname + "/public/index.html");
  } catch (error) {
    next();
  }
}); */

// Handle Error Requests
app.use((req, res, next) => {
  const error = new Error();
  error.message = "Not Found";
  error.status = 404;

  next(error);
});

app.use((error, req, res, next) => {
  console.log(error);

  res.status(error.status || 500).json({
    error,
  });
});

module.exports = app;