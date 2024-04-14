const express = require("express");
const router = express.Router();
const tourController = require("../controllers/tour.controller");
const dbConnect = require("../config/db.config");
const multer = require("multer");
const checkAuth = require("../middleware/checkAuth");

// Cấu hình multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/extras");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage }).array("images", 5);

const storageSingle = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const uploadSingle = multer({ storage: storageSingle });

router.get("/", tourController.getTour);
router.get("/:id", tourController.getOneTour);
router.post("/create", tourController.createTour);
router.put("/update/:id", tourController.updateTour);
router.delete("/delete/:id", checkAuth, tourController.deleteTour);

router.get("/imageExtras/:MaTour", (req, res) => {
  const MaTour = req.params.MaTour;

  const query =
    "SELECT * FROM hinhanhtour WHERE MaTour = ? AND PhanLoaiAnh = ?";
  const values = [MaTour, 2]; // Lấy các URL có PhanLoaiAnh = 2

  dbConnect.query(query, values, (error, results) => {
    if (error) {
      console.error("Error retrieving images from database:", error);
      return res
        .status(500)
        .json({ error: "Error retrieving images from database" });
    } else {
      return res.status(200).json({ images: results });
    }
  });
});

router.get("/booking-tour/:MaTour", (req, res) => {
  const MaTour = req.params.MaTour;
  const sql = `SELECT *, 
    hinhanhtour.URL,
    chude.TenChuDe,
    taikhoan.MaTaikhoan, taikhoan.HoTen, taikhoan.GioiTinh, taikhoan.Email, taikhoan.LienHe
    FROM tour
    JOIN hinhanhtour on tour.MaTour = hinhanhtour.MaTour AND PhanLoaiAnh = 1
    JOIN chude ON tour.MaChuDe = chude.MaChuDe
    JOIN chitiettour ON tour.MaTour = chitiettour.MaTour
    JOIN taikhoan ON chitiettour.MaTaikhoan = taikhoan.MaTaikhoan
    WHERE tour.MaTour = ? `;

  dbConnect.query(sql, [MaTour], (err, result) => {
    if (err) {
      console.error("Lỗi khi thực hiện truy vấn:", err);
      res
        .status(500)
        .send("Đã xảy ra lỗi khi lấy thông tin tour và tài khoản.");
    } else {
      res.json(result);
    }
  });
});

router.post(
  "/uploadCateImage/:MaTour",
  uploadSingle.single("image"),
  (req, res) => {
    const MaTour = req.params.MaTour;
    const URL = "/uploads/" + req.file.filename;
    try {
      // Kiểm tra xem dữ liệu đã tồn tại hay không
      const selectSql = `SELECT * FROM hinhanhtour WHERE MaTour = ? AND PhanLoaiAnh = ?`;
      dbConnect.query(selectSql, [MaTour, 1], (selectError, selectResults) => {
        if (selectError) {
          throw selectError;
        }
        // Nếu có dữ liệu, thực hiện UPDATE
        if (selectResults.length > 0) {
          const updateSql = `UPDATE hinhanhtour SET URL = ?, PhanLoaiAnh = ? WHERE MaTour = ?`;
          dbConnect.query(
            updateSql,
            [URL, 1, MaTour, 1],
            (updateError, updateResults) => {
              if (updateError) {
                throw updateError;
              }
              res
                .status(200)
                .json({ message: "Ảnh đã được cập nhật thành công" });
            }
          );
        } else {
          // Nếu không có dữ liệu, thực hiện INSERT
          const insertSql = `INSERT INTO hinhanhtour (MaTour, URL, PhanLoaiAnh) VALUES (?, ?, ?)`;
          dbConnect.query(
            insertSql,
            [MaTour, URL, 1],
            (insertError, insertResults) => {
              if (insertError) {
                throw insertError;
              }
              res.status(200).json({
                message: "Ảnh đã được tải lên và chèn mới thành công",
              });
            }
          );
        }
      });
    } catch (error) {
      console.error("Lỗi khi tải lên và cập nhật ảnh:", error);
      res.status(500).json({ error: "Đã xảy ra lỗi khi xử lý yêu cầu" });
    }
  }
);

router.post("/uploadExtras/:MaTour", (req, res) => {
  const MaTour = req.params.MaTour;
  upload(req, res, (err) => {
    if (err) {
      console.error("Error uploading images:", err);
      return res.status(500).json({ error: "Error uploading images" });
    }
    // Lưu trữ đường dẫn tới ảnh vào cơ sở dữ liệu
    req.files.forEach((file) => {
      const imagePath = "/extras/" + file.filename;
      const query =
        "INSERT INTO hinhanhtour (MaTour, URL, PhanLoaiAnh) VALUES (?, ?, ?)";
      const values = [MaTour, imagePath, 2];

      dbConnect.query(query, values, (error, results) => {
        if (error) {
          console.error("Error inserting image path into database:", error);
          return res
            .status(500)
            .json({ error: "Error inserting image path into database" });
        }
      });
    });
    // Trả về phản hồi thành công nếu không có lỗi
    return res.status(200).json({ message: "Images uploaded successfully" });
  });
});

router.delete("/deleteImage/:MaHinhanh", (req, res) => {
  const MaHinhanh = req.params.MaHinhanh;

  const query = "DELETE FROM hinhanhtour WHERE MaHinhanh = ?";
  const values = [MaHinhanh];

  dbConnect.query(query, values, (error, results) => {
    if (error) {
      console.error("Error deleting image:", error);
      return res.status(500).json({ error: "Error deleting image" });
    }

    return res.status(200).json({ message: "Image deleted successfully" });
  });
});

router.get("/lichtrinhtour/:matour", (req, res) => {
  const matour = req.params.matour;
  const queryString = `
    SELECT lichtrinhtour.*
    FROM lichtrinhtour
    JOIN tour ON lichtrinhtour.MaTour = tour.MaTour
    WHERE tour.MaTour = ?`;
  dbConnect.query(queryString, [matour], (err, rows, fields) => {
    if (err) {
      console.log("Error retrieving tours: ", err);
      res.sendStatus(500); // Trả về lỗi nếu có lỗi khi truy vấn cơ sở dữ liệu
      return;
    }
    res.json(rows); // Trả về dữ liệu dưới dạng JSON
  });
});

router.get("/chitiettour/:matour", (req, res) => {
  const matour = req.params.matour;
  const queryString = ` SELECT chitiettour.*, taikhoan.HoTen, taikhoan.LienHe, taikhoan.Email, taikhoan.GioiTinh, taikhoan.Avatar_URL
    FROM chitiettour
    JOIN tour ON chitiettour.MaTour = tour.MaTour
    JOIN taikhoan ON taikhoan.MaTaikhoan = chitiettour.MaTaikhoan
    WHERE tour.MaTour = ? `;
  dbConnect.query(queryString, [matour], (err, rows, fields) => {
    if (err) {
      console.log("Error retrieving tours: ", err);
      res.sendStatus(500); // Trả về lỗi nếu có lỗi khi truy vấn cơ sở dữ liệu
      return;
    }
    res.json(rows); // Trả về dữ liệu dưới dạng JSON
  });
});

router.get("/category/tour_uudai", (req, res) => {
  const queryString = `
        SELECT tour.*, hinhanhtour.URL, chude.TenChuDe 
        FROM tour 
        LEFT JOIN hinhanhtour ON tour.MaTour = hinhanhtour.MaTour
        LEFT JOIN chude ON tour.MaChuDe = chude.MaChuDe 
        WHERE tour.MaChuDe = 3`;
  dbConnect.query(queryString, (err, rows, fields) => {
    if (err) {
      console.log("Error retrieving tours: ", err);
      res.sendStatus(500); // Trả về lỗi nếu có lỗi khi truy vấn cơ sở dữ liệu
      return;
    }
    res.json(rows); // Trả về dữ liệu dưới dạng JSON
  });
});

router.get("/lichtrinhtour/:MaTour", (req, res) => {
  const MaTour = req.params.MaTour;
  // Sử dụng câu truy vấn SQL để lấy các lịch trình tour
  const query = `
    SELECT *
    FROM lichtrinhtour
    WHERE MaTour = ?
  `;

  dbConnect.query(query, [MaTour], (err, result) => {
    if (err) {
      console.log(err);
      // Nếu có lỗi, gửi lại lỗi cho client
      res.status(500).json({ error: err.message });
    } else {
      // Nếu không có lỗi, gửi kết quả về client
      res.json(result);
    }
  });
});

router.get("/ttct_tour/:id", (req, res) => {
  const { id } = req.params;
  // Truy vấn SQL để lấy tất cả các chi tiết tour có idTour bằng id
  const sqlQuery = `SELECT taikhoan.*, chitiettour.*, 
    DATE_FORMAT(chitiettour.TTCT_ngaydi, '%Y-%m-%dT%H:%i:%s.000Z') AS TTCT_ngaydi_formatted,
    DATE_FORMAT(chitiettour.TTCT_ngayve, '%Y-%m-%dT%H:%i:%s.000Z') AS TTCT_ngayve_formatted
    FROM taikhoan
    INNER JOIN chitiettour ON taikhoan.MaTaikhoan = chitiettour.MaTaikhoan
    WHERE chitiettour.MaTour = ?`;
  // Thực hiện truy vấn
  dbConnect.query(sqlQuery, [id], (error, results, fields) => {
    if (error) {
      console.error("Error fetching chi tiet tour:", error);
      res.status(500).json({ error: "Error fetching chi tiet tour" });
      return;
    }

    // Trả về kết quả
    res.json(results);
  });
});

router.get("/cactourmoi", (req, res) => {
  const query = "SELECT * FROM tour";
  dbConnect.query(query, (error, results) => {
    if (error) {
      console.error("Lỗi truy vấn: " + error.stack);
      res.status(500).json({ status: false, message: "Lỗi server" });
      return;
    }
    res.status(200).json({ status: true, data: results });
  });
});

router.put("/schedule_lichtrinh/:scheduleId", (req, res) => {
  const scheduleId = req.params.scheduleId;
  const { NgayThamQuan, DiaDiem, NoiDung } = req.body;

  const updateQuery = `
    UPDATE lichtrinhtour
    SET NgayThamQuan = ?, DiaDiem = ?, NoiDung = ?
    WHERE MaLichtrinh = ?
  `;

  dbConnect.query(
    updateQuery,
    [NgayThamQuan, DiaDiem, NoiDung, scheduleId],
    (err, result) => {
      if (err) {
        console.error("Error updating schedule:", err);
        res.status(500).json({ error: "Error updating schedule" });
      } else {
        res.status(200).json({ message: "Schedule updated successfully" });
      }
    }
  );
});

router.get("/touryeuthich/:MaTaikhoan", (req, res) => {
  const MaTaikhoan = req.params.MaTaikhoan;
  const sql = `
    SELECT t.*, tf.*, tour.*, tf.MaTourDaLuu
    FROM touryeuthich tf
    INNER JOIN tour t ON tf.MaTour = t.MaTour
    INNER JOIN tour AS tour ON t.MaTour = tour.MaTour
    WHERE tf.MaTaikhoan = ?
  `;

  dbConnect.query(sql, [MaTaikhoan], (err, result) => {
    if (err) {
      console.error("Lỗi:", err);
      res.status(500).json({ error: "Lỗi khi lấy dữ liệu từ cơ sở dữ liệu." });
      return;
    }
    res.status(200).json(result);
  });
});

router.delete("/deleteTourYeuthich/:MaTourDaLuu", (req, res) => {
  const MaTourDaLuu = req.params.MaTourDaLuu;
  try {
    // Thực hiện câu lệnh SQL để xóa dữ liệu có MaTourDaLuu tương ứng
    const sql = "DELETE FROM touryeuthich WHERE MaTourDaLuu = ?";
    dbConnect.query(sql, [MaTourDaLuu], (error, results) => {
      if (error) {
        throw error;
      }
      // Trả về phản hồi thành công
      res.status(200).json({ message: "Xóa tour yêu thích thành công" });
    });
  } catch (error) {
    console.error("Lỗi khi xóa tour yêu thích:", error);
    // Trả về phản hồi lỗi
    res.status(500).json({ error: "Đã xảy ra lỗi khi xử lý yêu cầu" });
  }
});

router.delete("/scheduleDelete_lichtrinh/:scheduleId", (req, res) => {
  const scheduleId = req.params.scheduleId;

  const deleteQuery = `
    DELETE FROM lichtrinhtour
    WHERE MaLichtrinh = ?
  `;

  dbConnect.query(deleteQuery, [scheduleId], (err, result) => {
    if (err) {
      console.error("Error deleting schedule:", err);
      res.status(500).json({ error: "Error deleting schedule" });
    } else {
      if (result.affectedRows > 0) {
        res.status(200).json({ message: "Schedule deleted successfully" });
      } else {
        res.status(404).json({ error: "Schedule not found" });
      }
    }
  });
});

router.post("/touryeuthich", (req, res) => {
  let { MaTour, MaTaikhoan } = req.body; // Sử dụng let thay cho const
  // Thực hiện truy vấn SQL để chèn dữ liệu vào bảng touryeuthich
  const sql = `INSERT INTO touryeuthich (MaTour, MaTaikhoan) VALUES (?, ?)`;
  dbConnect.query(sql, [MaTour, MaTaikhoan], (err, result) => {
    if (err) {
      res.status(500).send("Lỗi khi thêm dữ liệu vào cơ sở dữ liệu");
      throw err;
    }
    res.status(200).send("Dữ liệu đã được lưu vào cơ sở dữ liệu");
  });
});

router.post("/ttct_tourInsert/:MaTour", async (req, res) => {
  const MaTour = req.params.MaTour;
  const { TTCT_ngaydi, TTCT_ngayve, TTCT_taptrung, TTCT_diemden } = req.body;

  try {
    // Kiểm tra xem dữ liệu đã tồn tại hay chưa
    const existingData = await dbConnect
      .promise()
      .query(
        `SELECT * FROM chitiettour WHERE MaTour = ? AND TTCT_ngaydi = ? AND TTCT_ngayve = ? AND TTCT_taptrung = ? AND TTCT_diemden = ?`,
        [MaTour, TTCT_ngaydi, TTCT_ngayve, TTCT_taptrung, TTCT_diemden]
      );

    // Nếu dữ liệu đã tồn tại, trả về mã trạng thái 409 (Conflict)
    if (existingData[0].length > 0) {
      return res.status(409).json({ message: "Data already exists" });
    }

    // Nếu dữ liệu chưa tồn tại, thực hiện insert
    await dbConnect
      .promise()
      .query(
        `INSERT INTO chitiettour (TTCT_ngaydi, TTCT_ngayve, TTCT_taptrung, TTCT_diemden, MaTour) VALUES (?, ?, ?, ?, ?)`,
        [TTCT_ngaydi, TTCT_ngayve, TTCT_taptrung, TTCT_diemden, MaTour]
      );

    // Trả về mã trạng thái 200 (OK) và thông báo thành công
    return res
      .status(200)
      .json({ message: "Data inserted into chitiettour successfully" });
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error("Error:", error);
    return res
      .status(500)
      .json({ error: "Error inserting data into chitiettour" });
  }
});

router.put("/ttct_tourUpdate/:MaTour", (req, res) => {
  const { MaTour } = req.params;
  const { TTCT_ngaydi, TTCT_ngayve, TTCT_taptrung, TTCT_diemden } = req.body;
  // Truy vấn SQL để cập nhật các trường của bản ghi có MaTour tương ứng
  const sqlQuery = `UPDATE chitiettour SET TTCT_ngaydi=?, TTCT_ngayve=?, TTCT_taptrung=?, TTCT_diemden=? WHERE MaTour=?`;
  // Thực hiện truy vấn
  dbConnect.query(
    sqlQuery,
    [TTCT_ngaydi, TTCT_ngayve, TTCT_taptrung, TTCT_diemden, MaTour],
    (error, results, fields) => {
      if (error) {
        console.error("Error updating chi tiet tour:", error);
        res.status(500).json({ error: "Error updating chi tiet tour" });
        return;
      }
      // Nếu không có lỗi, trả về thông báo cập nhật thành công
      res.status(200).json({ message: "Cập nhật thành công" });
    }
  );
});

router.put("/update-schedule/:id", (req, res) => {
  const { id } = req.params; // Lấy id của tour từ params
  const { NgayThamQuan, DiaDiem, NoiDung } = req.body; // Lấy thông tin lịch trình từ body request
  // Thực hiện thêm dữ liệu vào cơ sở dữ liệu
  const sql =
    "INSERT INTO lichtrinhtour (MaTour, NgayThamQuan, DiaDiem, NoiDung) VALUES (?, ?, ?, ?)";
  dbConnect.query(
    sql,
    [id, NgayThamQuan, DiaDiem, NoiDung], // Chèn id của tour vào cùng với dữ liệu lịch trình
    (err, results) => {
      if (err) {
        console.error("Error adding schedule: " + err.stack);
        res.status(500).send("Error adding schedule");
        return;
      }
      res.status(200).send("Schedule added successfully");
    }
  );
});

module.exports = router;
