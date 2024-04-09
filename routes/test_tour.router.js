const express = require("express");
const router = express.Router();
var dbConnect = require("../config/db.config");
const multer = require("multer");
const path = require("path");

var imgconfig = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "public/uploads");
  },
  filename: (req, file, callback) => {
    callback(null, `image_${Date.now()}.${file.originalname}`);
  },
});

var upload = multer({
  storage: imgconfig,
});

router.post("/addtour", upload.array("HinhAnh"), (req, res) => {
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

  const HinhAnh = req.files;
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
      if (HinhAnh && HinhAnh.length > 0) {
        HinhAnh.forEach((file) => {
          let url = file.path; // Đường dẫn tới file đã lưu trữ
          url = url.replace(/^public\\/, ""); // Loại bỏ 'public\\' từ đầu chuỗi
          const sqlInsertImage =
            "INSERT INTO hinhanhtour (Url, MaTour, PhanLoaiAnh) VALUES (?, ?, 1)";
          dbConnect.query(sqlInsertImage, [url, tourId], (err, result) => {
            if (err) {
              console.error("Error adding image:", err);
              return;
            }
          });
        });
      }

      res.status(200).send("Tour added successfully !");
    }
  );
});

module.exports = router;
