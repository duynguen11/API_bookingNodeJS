const express = require("express");
const router = express.Router();
var dbConnect = require("../config/db.config");

router.post("/historyBooking", (req, res) => {
  const MaTaikhoan_KH = req.body.MaTaikhoan_KH;
  const sql = ` SELECT chitietdattour.*, hinhanhtour.URL
    FROM chitietdattour
    JOIN hinhanhtour ON chitietdattour.MaTour = hinhanhtour.MaTour
    WHERE chitietdattour.MaTaikhoan_KH = ? AND hinhanhtour.PhanLoaiAnh = 1 `;

  dbConnect.query(sql, [MaTaikhoan_KH], (err, data) => {
    // Truyền MaTaikhoan_KH vào trong mảng tham số
    if (err) return res.json({ Status: false, Error: "Query error" + err });
    return res.status(200).json(data);
  });
});

router.post("/historyJoinning", (req, res) => {
  const MaTaikhoan_HDV = req.body.MaTaikhoan_HDV;
  const sql = ` SELECT chitietdattour.*, hinhanhtour.URL
    FROM chitietdattour
    JOIN hinhanhtour ON chitietdattour.MaTour = hinhanhtour.MaTour
    WHERE chitietdattour.MaTaikhoan_HDV = ? AND hinhanhtour.PhanLoaiAnh = 1 `;

  console.log("ID HDV đã nhận", MaTaikhoan_HDV);
  dbConnect.query(sql, [MaTaikhoan_HDV], (err, data) => {
    // Truyền MaTaikhoan_KH vào trong mảng tham số
    if (err) return res.json({ Status: false, Error: "Query error" + err });
    return res.status(200).json(data);
  });
});

router.post("/submitBooking", (req, res) => {
  try {
    const data = req.body;
    // Trích xuất các trường từ req.body
    const {
      MaTour,
      MaTaikhoan_KH,
      HoTen,
      Email,
      LienHe,
      DiaChi,
      SoCho,
      TongGia,
      MaTaikhoan_HDV,
      ThoiGianDat,
      TrangThai,
      ThanhToan,
    } = data;
    const date = new Date(ThoiGianDat);
    const formattedDateTime = date.toISOString().slice(0, 19).replace("T", " ");
    // Kiểm tra số chỗ trống trong tour
    dbConnect.query(
      "SELECT SoCho FROM tour WHERE MaTour = ?",
      [MaTour],
      (err, result) => {
        if (err) {
          console.error("Error querying database:", err);
          return res.status(500).json({ message: "Internal Server Error" });
        }

        if (result.length === 0) {
          return res.status(404).json({ message: "Tour not found" });
        }

        const remainingSeats = result[0].SoCho - SoCho;

        if (remainingSeats < 0) {
          return res
            .status(400)
            .json({ message: "Not enough seats available" });
        }

        // Thêm đặt tour vào cơ sở dữ liệu
        const sqlInsertBooking = `
            INSERT INTO chitietdattour (
              MaTour, 
              MaTaikhoan_KH, 
              HoTen, 
              Email, 
              LienHe, 
              DiaChi, 
              SoCho, 
              TongGia, 
              MaTaikhoan_HDV, 
              ThoiGianDat, 
              TrangThai, 
              ThanhToan
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
          MaTour,
          MaTaikhoan_KH,
          HoTen,
          Email,
          LienHe,
          DiaChi,
          SoCho,
          TongGia,
          MaTaikhoan_HDV,
          formattedDateTime,
          TrangThai,
          ThanhToan,
        ];

        dbConnect.query(sqlInsertBooking, values, (err, result) => {
          if (err) {
            console.error("Error inserting data into database:", err);
            return res.status(500).json({ message: "Internal Server Error" });
          }

          console.log("Booking inserted successfully");
          // Trừ số chỗ từ bảng Tour
          const sqlUpdateTour = "UPDATE tour SET SoCho = ? WHERE MaTour = ?";
          const updatedSeats = remainingSeats > 0 ? remainingSeats : 0;
          dbConnect.query(
            sqlUpdateTour,
            [updatedSeats, MaTour],
            (err, result) => {
              if (err) {
                console.error("Error updating tour seats:", err);
                return res
                  .status(500)
                  .json({ message: "Internal Server Error" });
              }

              console.log("Tour seats updated successfully");
              res.status(200).json({ message: "Booking successful" });
            }
          );
        });
      }
    );
  } catch (error) {
    console.error("Error handling request:", error);
    res.status(400).json({ message: "Bad Request" });
  }
});

router.get("/allSubmitBooking", (req, res) => {
  const sql = `SELECT 
    chitietdattour.*, 
    taikhoan_HDV.HoTen AS HoTen_HDV, 
    taikhoan_KH.HoTen AS HoTen_KH, 
    taikhoan_KH.PhanLoaiTK,
    hinhanhtour.URL AS HinhAnhTour
    FROM 
      chitietdattour
    JOIN 
      taikhoan AS taikhoan_HDV ON chitietdattour.MaTaikhoan_HDV = taikhoan_HDV.MaTaikhoan
    JOIN 
      taikhoan AS taikhoan_KH ON chitietdattour.MaTaikhoan_KH = taikhoan_KH.MaTaikhoan
    JOIN 
      hinhanhtour ON chitietdattour.MaTour = hinhanhtour.MaTour
    WHERE 
      hinhanhtour.PhanLoaiAnh = 1`;

  dbConnect.query(sql, (err, data) => {
    if (err) {
      console.error("Lỗi khi lấy data tourbooking", err);
      return res
        .status(500)
        .json({ message: "Có lỗi khi lấy dữ liệu tourbooking" });
    }

    console.log("Dữ liệu tourBooking:", data);
    res.status(200).json(data);
  });
});

module.exports = router;
