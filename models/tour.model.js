var dbConnect = require("../config/db.config");
const multer = require("multer");
const path = require("path");

var tour = function (tour) {
  this.MaTour = tour.MaTour;
  this.TenTour = tour.TenTour;
  this.GiaTour = tour.GiaTour;
  this.ThoiGian = tour.ThoiGian;
  this.NgayKhoiHanh = tour.NgayKhoiHanh;
  this.NoiKhoiHanh = tour.NoiKhoiHanh;
  this.DiemDen = tour.DiemDen;
  this.SoCho = tour.SoCho;
  this.PhuongTien = tour.PhuongTien;
  this.MaChuDe = tour.MaChuDe;
  this.MoTa = tour.MoTa;
};

tour.getAllTour = function (result) {
  const getAllQuery = `SELECT tour.*, hinhanhtour.URL, chude.TenChuDe
  FROM tour
  LEFT JOIN hinhanhtour ON tour.MaTour = hinhanhtour.MaTour AND hinhanhtour.PhanLoaiAnh = 1
  LEFT JOIN chude ON tour.MaChuDe = chude.MaChuDe`;
  dbConnect.query(getAllQuery, (err, res) => {
    if (err) {
      result(null, err);
    } else {
      result(null, res);
    }
  });
};

tour.getTourID = function (id, data) {
  const sql = `SELECT tour.*, hinhanhtour.URL, hinhanhtour.MaHinhAnh, chude.TenChuDe 
  FROM tour
  LEFT JOIN hinhanhtour ON tour.MaTour = hinhanhtour.MaTour AND hinhanhtour.PhanLoaiAnh = 1
  LEFT JOIN chude ON tour.MaChuDe = chude.MaChuDe 
  WHERE tour.MaTour = ?`;
  dbConnect.query(sql, [id], (err, res) => {
    if (err) {
      data(null, err);
    } else {
      data(null, res);
    }
  });
};

tour.createNewTour = function (tourReq, data) {
  const createQuery = "INSERT INTO tour SET ?";
  dbConnect.query(createQuery, tourReq, (err, res) => {
    if (err) {
      data(null, err);
    } else {
      data(null, res);
    }
  });
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

tour.updateTourId = function (id, tourReq, data) {
  const updateQuery =
    "UPDATE tour SET TenTour = ?, GiaTour = ?, ThoiGian = ?, NgayKhoiHanh = ?, NoiKHoiHanh = ?, SoCho = ?, PhuongTien = ?, MaChuDe = ?, MoTa = ?, DiemDen = ? WHERE MaTour = ?";
  dbConnect.query(
    updateQuery,
    [
      tourReq.TenTour,
      tourReq.GiaTour,
      tourReq.ThoiGian,
      tourReq.NgayKhoiHanh,
      tourReq.NoiKhoiHanh,
      tourReq.SoCho,
      tourReq.PhuongTien,
      tourReq.MaChuDe,
      tourReq.MoTa,
      tourReq.DiemDen,
      id,
    ],
    (err, queryResult) => {
      if (err) {
        console.error("Lỗi khi cập nhật tour:", err);
        data(null, err);
      } else {
        console.log("Cập nhật tour thành công!");
        data(null, queryResult);
      }
    }
  );
};

tour.deleteTourId = function (id, data) {
  const deleteImageQuery = `DELETE FROM hinhanhtour WHERE MaTour = ?`;
  const deleteTourQuery = `DELETE FROM tour WHERE MaTour = ?`;

  dbConnect.query(deleteImageQuery, [id], (err, res) => {
    if (err) {
      data(null, err);
    } else {
      dbConnect.query(deleteTourQuery, [id], (err, res) => {
        if (err) {
          data(null, err);
        } else {
          data(null, res);
        }
      });
    }
  });
};

module.exports = tour;
