const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");

const accountRouter = require("./routes/account.router");
const chudeRouter = require("./routes/chude.router");
const tourRouter = require("./routes/tour.router");
const testTourRouter = require("./routes/test_tour.router");
const ctgtRouter = require("./routes/chitietgiatour.router");
const hopthuRouter = require('./routes/hopthu.router')
dotenv.config();

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/api/account", accountRouter);
app.use("/api/chude", chudeRouter);
app.use("/api/tour", tourRouter);
app.use("/api/test_tour", testTourRouter);
app.use("/api/chitietgiatour", ctgtRouter);
app.use('/api/hopthu', hopthuRouter)

app.listen(process.env.PORT || 1011, () => {
  console.log(`API running on PORT(${process.env.PORT})...`);
});
