const chudeModel = require("../models/chude.model");

exports.getChuDe = (req, res) => {
  chudeModel.getAllChuDe((err, data) => {
    if (err) {
      console.error("Error fetching data!", err);
      return res
        .status(500)
        .json({ error: "Error fetching data!", details: err.message });
    }
    return res.status(200).json(data);
  });
};

exports.createChuDe = (req, res) => {
  const chudeReq = new chudeModel(req.body);
  chudeModel.createNewChuDe(chudeReq, (err, data) => {
    if (err) res.send(err);
    console.log("DATA: ", data);
    res.json({ status: true, message: "Created ok!" });
  });
};

exports.updateChuDe = (req, res) => {
  const chudeReq = new chudeModel(req.body);
  chudeModel.updateChuDeId(req.params.id, chudeReq, (err, data) => {
    if (err) res.send(err);
    console.log("DATA: ", data);
    res.json({ status: true, message: "Updated ok!" });
  });
};

exports.deleteChuDe = (req, res) => {
  const chudeId = req.params.id;
  // Kiểm tra xem có tour nào thuộc chủ đề không
  chudeModel.deleteChuDeId(chudeId, (err, data) => {
    if (err) {
      return res.status(500).json({
        status: false,
        message: err.message || "Internal server error",
      });
    }
    res.json({ status: true, message: "Delete ok!" });
  });
};
