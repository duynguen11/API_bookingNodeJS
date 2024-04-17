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
const hopthuRouter = require("./routes/hopthu.router");
const chitietdattoutRouter = require("./routes/chitietdattour");
dotenv.config();

app.use(cors({ origin: true, credentials: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Đảm bảo rằng tất cả các yêu cầu CORS đều được xử lý đúng
app.options("*", cors());

// Sử dụng middleware để phục vụ tệp tĩnh từ thư mục public
app.use(express.static("public"));
app.use("/api/account", accountRouter);
app.use("/api/chude", chudeRouter);
app.use("/api/tour", tourRouter);
app.use("/api/test_tour", testTourRouter);
app.use("/api/chitietgiatour", ctgtRouter);
app.use("/api/hopthu", hopthuRouter);
app.use("/api/chitietdattour", chitietdattoutRouter);

app.listen(process.env.PORT || 1011, () => {
  console.log(`API running on PORT(${process.env.PORT})...`);
});
