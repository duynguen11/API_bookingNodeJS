const tourModel = require("../models/tour.model");

const moment = require("moment");

exports.getTour = (req, res) => {
  tourModel.getAllTour((err, data) => {
    if (err) {
      res.res(err);
      return;
    } else {
      res.send(data);
    }
    // In ra dữ liệu tour để kiểm tra
  });
};

exports.getOneTour = (req, res) => {
  tourModel.getTourID(req.params.id, (err, data) => {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

exports.createTour = (req, res) => {
  const tourReq = new tourModel(req.body);
  tourModel.createNewTour(tourReq, (err, data) => {
    if (err) res.send(err);
    res.json({ status: true, data: data });
  });
};

exports.updateTour = (req, res) => {
  // Tạo một instance mới của tourModel từ dữ liệu yêu cầu (req.body)
  const tourReq = new tourModel(req.body);
  // Gọi hàm updateTourId từ model để cập nhật thông tin tour
  tourModel.updateTourId(req.params.id, tourReq, (err, data) => {
    if (err) {
      // Nếu có lỗi, gửi lại lỗi cho client
      res.status(500).json({ status: false, error: err });
    } else {
      // Nếu không có lỗi, gửi lại dữ liệu đã cập nhật cho client
      res.json({ status: true, data: data });
    }
  });
};

exports.deleteTour = (req, res) => {
  tourModel.deleteTourId(req.params.id, (err, data) => {
    if (err) res.send(err);
    res.json({ status: true, message: "Delete ok!" });
  });
};
