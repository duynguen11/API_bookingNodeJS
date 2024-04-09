var dbConnect = require("../config/db.config");

var chudeModel = function (chudeModel) {
  this.MaChuDe = chudeModel.MaChuDe;
  this.TenChuDe = chudeModel.TenChuDe;
  this.ThongTinChuDe = chudeModel.ThongTinChuDe;
};

chudeModel.getAllChuDe = (data) => {
  const sql = "SELECT * FROM chude";
  dbConnect.query(sql, (err, res) => {
    if (err) {
      data(err, null);
    } else {
      data(null, res);
    }
  });
};

chudeModel.createNewChuDe = function (chudeReq, data) {
  const createQuery = "INSERT INTO chude SET ?";
  dbConnect.query(createQuery, chudeReq, (err, res) => {
    if (err) {
      data(null, err);
    } else {
      data(null, res);
    }
  });
};

chudeModel.updateChuDeId = function (id, chudeReq, data) {
  const updateQuery =
    "UPDATE chude SET MaChuDe = ?, TenChuDe = ?, ThongTinChuDe = ? WHERE MaChuDe = ?";
  dbConnect.query(
    updateQuery,
    [chudeReq.MaChuDe, chudeReq.TenChuDe, chudeReq.ThongTinChuDe, id],
    (err, res) => {
      if (err) {
        data(null, err);
      } else {
        data(null, res);
      }
    }
  );
};

module.exports = chudeModel;
