const express = require("express");
const router = express.Router();
var dbConnect = require("../config/db.config");

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

module.exports = router;
