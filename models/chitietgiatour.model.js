var dbConnect = require("../config/db.config");

var chitietgiatour = function (chitietgiatour) {
  this.MaChiTietGiaTour = chitietgiatour.MaChiTietGiaTour;
  this.GiaTienTour = chitietgiatour.GiaTienTour;
  this.LoaiKhach = chitietgiatour.LoaiKhach;
};

chitietgiatour.getCTGTByMatour = function (id, data) {
  const sql = 'SELECT * FROM chitietgiatour WHERE MaTour = ?';
  dbConnect.query(sql, [id], (err, res) => {
    if (err) {
      console.log("Error while deleting!");
      data(null, err);
    } else {
      console.log("Data fetch successfully!");
      data(null, res);
    }
  })
}

chitietgiatour.getAllCTGT = function (data) {
  const getAllQuery = "SELECT * FROM chitietgiatour";
  dbConnect.query(getAllQuery, (err, res) => {
    if (err) {
      console.log("Error fetching data!", err);
      data(null, err);
    } else {
      console.log("Data fetched successfully!");
      data(null, res);
    }
  });
};

chitietgiatour.createNewCTGT = function (ctgtReq, data) {
  const sqlDelete = `DELETE FROM chitietgiatour WHERE LoaiKhach = ? and MaTour = ${ctgtReq.matour};`
  const sqlInsert = `INSERT INTO chitietgiatour (LoaiKhach, GiaTourChiTiet, MaTour) VALUES (?, ?, ${ctgtReq.matour});`
  dbConnect.query(sqlDelete, 1, (err, res) => {});
  dbConnect.query(sqlInsert, [1, ctgtReq.nguoilon], (err, res) => {});
  dbConnect.query(sqlDelete, 2, (err, res) => {});
  dbConnect.query(sqlInsert, [2, ctgtReq.treem], (err, res) => {});
  dbConnect.query(sqlDelete, 3, (err, res) => {});
  dbConnect.query(sqlInsert, [3, ctgtReq.trenho], (err, res) => {});
  dbConnect.query(sqlDelete, 4, (err, res) => {});
  dbConnect.query(sqlInsert, [4, ctgtReq.embe], (err, res) => {});
  dbConnect.query(sqlDelete, 5, (err, res) => {});
  dbConnect.query(sqlInsert, [5, ctgtReq.phuthu], (err, res) => {});
};

chitietgiatour.updateCTGTId = function (id, ctgtReq, data) {
  const updateQuery =
    "UPDATE chitietgiatour SET GiaTienTour = ?, LoaiKhach = ? WHERE MaChiTietGiaTour = ?";
  dbConnect.query(
    updateQuery,
    [ctgtReq.GiaTienTour, ctgtReq.LoaiKhach, id],
    (err, res) => {
      if (err) {
        console.log("Error while updating!");
        data(null, err);
      } else {
        console.log("Data updated successfully!");
        data(null, res);
      }
    }
  );
};

chitietgiatour.deleteCTGTId = function (id, data) {
  const deleteQuery = "DELETE FROM chitietgiatour WHERE MaChiTietGiaTour = ?";
  dbConnect.query(deleteQuery, [id], (err, res) => {
    if (err) {
      console.log("Error while deleting!");
      data(null, err);
    } else {
      console.log("Data deleted successfully!");
      data(null, res);
    }
  });
};

module.exports = chitietgiatour;
