const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/checkAuth");
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

router.get("/tourrunning", (req, res) => {
  const query = `
  SELECT chitietdattour.*, hinhanhtour.URL 
  FROM chitietdattour 
  JOIN hinhanhtour ON chitietdattour.MaTour = hinhanhtour.MaTour 
  WHERE chitietdattour.TrangThai = 'Tour đã được duyệt' 
  AND hinhanhtour.PhanLoaiAnh = 1 `;
  dbConnect.query(query, (error, results) => {
    if (error) {
      console.error("Lỗi khi lấy chi tiết tour:", error);
      res
        .status(500)
        .json({ message: "Đã xảy ra lỗi khi lấy dữ liệu chi tiết tour." });
      return;
    }
    res.json(results);
  });
});

router.get("/allSubmitBooking", checkAuth, (req, res) => {
  const sql = `SELECT 
  chitietdattour.*, 
  COALESCE(taikhoan_KH.HoTen, chitietdattour.HoTen) AS HoTen_KH,
  COALESCE(taikhoan_KH.PhanLoaiTK, 'Không có') AS PhanLoaiTK,
  taikhoan_HDV.HoTen AS HoTen_HDV, 
  hinhanhtour.URL AS HinhAnhTour
  FROM 
    chitietdattour
  LEFT JOIN 
    taikhoan AS taikhoan_HDV ON chitietdattour.MaTaikhoan_HDV = taikhoan_HDV.MaTaikhoan
  LEFT JOIN 
    taikhoan AS taikhoan_KH ON chitietdattour.MaTaikhoan_KH = taikhoan_KH.MaTaikhoan
  JOIN 
    hinhanhtour ON chitietdattour.MaTour = hinhanhtour.MaTour
  WHERE 
    hinhanhtour.PhanLoaiAnh = 1`;

  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "Chỉ có quản trị viên mới được phép truy cập vào route này",
    });
  }

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

router.put("/updateBookingStatus", (req, res) => {
  const { MaDatTour, TrangThai } = req.body;
  // Kiểm tra xem MaDatTour và TrangThai có được gửi trong body hay không
  if (!MaDatTour || !TrangThai) {
    return res
      .status(400)
      .json({ error: "Missing MaDatTour or TrangThai in request body" });
  }

  // Mã SQL để cập nhật TrangThai dựa trên MaDatTour và TrangThai từ body của yêu cầu
  const sql = `UPDATE chitietdattour SET TrangThai = ? WHERE MaDatTour = ?`;

  // Thực hiện truy vấn SQL với MaDatTour và TrangThai
  dbConnect.query(sql, [TrangThai, MaDatTour], (error, results) => {
    if (error) {
      res.status(500).json({ error: "Có lỗi xảy ra khi cập nhật TrangThai" });
    } else {
      res.status(200).json({ message: "Cập nhật TrangThai thành công" });
    }
  });
});

module.exports = router;
