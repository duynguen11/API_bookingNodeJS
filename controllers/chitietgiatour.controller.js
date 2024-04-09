const chitietgiatourModel = require("../models/chitietgiatour.model");

exports.getCTGT = (req, res) => {
  chitietgiatourModel.getAllCTGT((err, result) => {
    if (err) res.res(err);
    console.log("DATA chi tiết giá ok!");
    res.status(200).json(result);
  });
};

exports.getCTGTID = (req, res) => {
  const MaTour = req.params.id;
  chitietgiatourModel.getCTGTByMatour(MaTour, (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Fetch data CTGT error", err });
    }

    return res.status(200).json(data);
  });
};

exports.createCTGT = (req, res) => {
  chitietgiatourModel.createNewCTGT(req.body, (err, data) => {
    if (err) res.send(err);
    console.log("DATA: ", data);
    res.json({ status: true, message: "Created ok!" });
  });
};

exports.updateCTGT = (req, res) => {
  const ctgtReq = new chitietgiatourModel(req.body);
  chitietgiatourModel.updateCTGTId(req.params.id, ctgtReq, (err, data) => {
    if (err) res.send(err);
    console.log("DATA: ", data);
    res.json({ status: true, message: "Updated ok!" });
  });
};

exports.deleteCTGT = (req, res) => {
  chitietgiatourModel.deleteCTGTId(req.params.id, (err, data) => {
    if (err) res.send(err);
    console.log("DATA: ", data);
    res.json({ status: true, message: "Delete ok" });
  });
};
