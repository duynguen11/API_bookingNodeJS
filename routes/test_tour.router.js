const express = require("express");
const router = express.Router();
var dbConnect = require("../config/db.config");
const multer = require("multer");
const path = require("path");

const imgconfig = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "public/uploads");
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});

const upload = multer({
  storage: imgconfig,
});

router.post("/addtour", upload.single("HinhAnh"), (req, res) => {
  const {
    TenTour,
    GiaTour,
    ThoiGian,
    NgayKhoiHanh,
    NoiKhoiHanh,
    SoCho,
    PhuongTien,
    DiemDen,
    MaChuDe,
    MoTa,
  } = req.body;

  const HinhAnh = req.file; // Sử dụng req.file thay vì req.files
  const sqlInsertTour =
    "INSERT INTO tour (TenTour, GiaTour, ThoiGian, NgayKhoiHanh, NoiKhoiHanh, SoCho, PhuongTien, DiemDen, MaChuDe, MoTa) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
  dbConnect.query(
    sqlInsertTour,
    [
      TenTour,
      GiaTour,
      ThoiGian,
      NgayKhoiHanh,
      NoiKhoiHanh,
      SoCho,
      PhuongTien,
      DiemDen,
      MaChuDe,
      MoTa,
    ],
    (err, result) => {
      if (err) {
        console.error("Error adding tour:", err);
        res.status(500).send("Error adding tour");
        return;
      }
      const tourId = result.insertId;
      if (HinhAnh) { // Kiểm tra xem tệp đã được tải lên chưa
        const imagePath = "/uploads/" + HinhAnh.filename;
        const sqlInsertImage =
          "INSERT INTO hinhanhtour (Url, MaTour, PhanLoaiAnh) VALUES (?, ?, 1)";
        dbConnect.query(sqlInsertImage, [imagePath, tourId], (err, result) => {
          if (err) {
            console.error("Error adding image:", err);
            return;
          }
        });
      }

      res.status(200).send("Tour added successfully !");
    }
  );
});

module.exports = router;
