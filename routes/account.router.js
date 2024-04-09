const express = require("express");
const router = express.Router();
var dbConnect = require("../config/db.config");
const { LocalStorage } = require("node-localstorage");
const localStorage = new LocalStorage("./scratch");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/avatars");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, uniqueSuffix + extension);
  },
});

const upload = multer({ storage: storage });

router.post("/register", (req, res) => {
  const { TaiKhoan, MatKhau, Email } = req.body;
  const PhanLoaiTK = "thành viên";
  // Kiểm tra xem tài khoản đã tồn tại trong cơ sở dữ liệu chưa
  const checkAccountQuery =
    "SELECT COUNT(*) AS count FROM taikhoan WHERE TaiKhoan = ?";
  dbConnect.query(checkAccountQuery, [TaiKhoan], (checkErr, checkResults) => {
    if (checkErr) {
      console.error("Error checking account: " + checkErr.stack);
      res.status(500).send("Error checking account");
      return;
    }
    // Nếu tài khoản đã tồn tại, trả về lỗi
    if (checkResults[0].count > 0) {
      res.status(400).send("Tài khoản đã tồn tại");
      return;
    }
    const NgayTao = new Date().toISOString().slice(0, 19).replace("T", " ");
    // Nếu tài khoản không tồn tại, thêm mới vào cơ sở dữ liệu
    const insertQuery =
      "INSERT INTO taikhoan (TaiKhoan, MatKhau, Email, PhanLoaiTK, NgayTao) VALUES (?, ?, ?, ?, ?)";
    dbConnect.query(
      insertQuery,
      [TaiKhoan, MatKhau, Email, PhanLoaiTK, NgayTao],
      (err, results) => {
        if (err) {
          console.error("Error registering user: " + err.stack);
          res.status(500).send("Error registering user");
          return;
        }
        console.log("User registered successfully");
        res.status(200).send("User registered successfully");
      }
    );
  });
});

router.post("/add-account", (req, res) => {
  // Lấy thông tin tài khoản từ request body
  const { TaiKhoan, MatKhau, PhanLoaiTK } = req.body;

  // Xác thực input: kiểm tra xem tất cả các trường thông tin cần thiết đã được cung cấp chưa
  if (!TaiKhoan || !MatKhau || !PhanLoaiTK) {
    return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin" });
  }

  // Thực hiện truy vấn để chèn tài khoản mới vào cơ sở dữ liệu
  const sql =
    "INSERT INTO taikhoan (TaiKhoan, MatKhau, PhanLoaiTK) VALUES (?, ?, ?)";
  dbConnect.query(sql, [TaiKhoan, MatKhau, PhanLoaiTK], (error, results) => {
    if (error) {
      console.error("Lỗi khi thêm tài khoản:", error);
      return res
        .status(500)
        .json({ error: "Có lỗi xảy ra khi thêm tài khoản" });
    }
    // Trả về thông báo thành công nếu không có lỗi
    res.status(200).json({ message: "Thêm tài khoản thành công" });
  });
});

router.post("/login", (req, res) => {
  const { TaiKhoan, MatKhau } = req.body;
  // Xác thực input
  if (!TaiKhoan || !MatKhau) {
    return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin" });
  }
  // Thực hiện truy vấn để kiểm tra đăng nhập
  const sql = "SELECT * FROM taikhoan WHERE TaiKhoan = ? AND MatKhau = ?";
  dbConnect.query(sql, [TaiKhoan, MatKhau], (err, results) => {
    if (err) {
      console.error("Error executing query:", err);
      return res
        .status(500)
        .json({ error: "Có lỗi xảy ra trong quá trình xử lý yêu cầu" });
    }

    if (results.length > 0) {
      const user = results[0];
      // Mặc định quyền truy cập là user
      let role = "user";
      // Kiểm tra xem người dùng có phải là admin không
      if (user.PhanLoaiTK === "admin") {
        role = "admin";
      } else if (user.PhanLoaiTK === "nhanvien") {
        role = "nhanvien";
      }
      // Trả về thông tin người dùng và quyền truy cập
      return res
        .status(200)
        .json({ message: "Đăng nhập thành công !", user, role });
    } else {
      // Trả về lỗi nếu đăng nhập không thành công
      return res
        .status(401)
        .json({ error: "Tên người dùng hoặc mật khẩu không chính xác" });
    }
  });
});

router.post("/user/login", (req, res) => {
  const { TaiKhoan, MatKhau } = req.body;
  const query = `SELECT * FROM taikhoan WHERE TaiKhoan = ? AND MatKhau = ?`;

  dbConnect.query(query, [TaiKhoan, MatKhau], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
    if (results.length > 0) {
      const user = results[0];
      if (user.PhanLoaiTK === "thành viên") {
        const userId = user.MaTaikhoan;
        const userName = user.TaiKhoan; // Lấy userId từ cơ sở dữ liệu
        localStorage.setItem("userId", userId);
        localStorage.setItem("userName", userName); // Lưu userId vào localStorage
        return res.status(200).json({
          success: true,
          message: "Login successful",
          userId,
          userName,
        }); // Trả về userId cho phía client
      } else {
        // Phân loại tài khoản không phải là khách, đăng nhập không thành công
        return res
          .status(401)
          .json({ success: false, message: "Không được cấp quyền sử dụng" });
      }
    } else {
      // Không tìm thấy tài khoản hoặc mật khẩu không đúng
      return res
        .status(401)
        .json({ success: false, message: "Tài khoản hoặc mật khẩu không đúng" });
    }
  });
});

router.post("/messbox", (req, res) => {
  const { hoten, email, tinnhan, lienhe, MaTaikhoan } = req.body;
  
  const trangthai = "đợi phản hồi";
  // Lấy thời gian hiện tại
  const thoigiangui = new Date().toISOString().slice(0, 19).replace("T", " "); // Lấy thời gian ở định dạng 'YYYY-MM-DD HH:MM:SS'
  // Tạo một bản ghi mới trong cơ sở dữ liệu
  const sql =
    "INSERT INTO hopthu (hoten, email, tinnhan, lienhe, thoigiangui, trangthai, MaTaikhoan) VALUES (?, ?, ?, ?, ?, ?, ?)";
  const values = [
    hoten,
    email,
    tinnhan,
    lienhe,
    thoigiangui,
    trangthai,
    MaTaikhoan,
  ];

  dbConnect.query(sql, values, (err, result) => {
    if (err) {
      throw err;
    }
    res.status(201).json({ message: "Thông tin liên hệ đã được lưu trữ." });
  });
});

router.get("/employees", (req, res) => {
  // Truy vấn để lấy tất cả nhân viên có PhanLoaiTK = 'nhanvien' (chuỗi 'nhanvien' trong dấu nháy đơn)
  dbConnect.query(
    "SELECT * FROM taikhoan WHERE PhanLoaiTK = 'nhanvien'",
    function (error, results) {
      if (error) {
        res.status(500).json({ error: "Lỗi truy vấn cơ sở dữ liệu" });
      } else {
        res.json(results); // Trả về kết quả dưới dạng JSON
      }
    }
  );
});

router.get("/users", (req, res) => {
  dbConnect.query(
    "SELECT * FROM taikhoan WHERE PhanLoaiTK = 'thành viên'",
    (err, data) => {
      if (err) {
        res.status(500).json({ error: "Lỗi truy vấn cơ sở dữ liệu" });
      } else {
        res.status(200).json(data);
      }
    }
  );
});

router.get("/info-khachhang/:id", (req, res) => {
  const id = req.params.id;
  const query = "SELECT * FROM taikhoan WHERE MaTaikhoan = ?";
  dbConnect.query(query, [id], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
    if (results.length > 0) {
      const userInfo = results[0];
      return res.status(200).json({
        success: true,
        message: "User information retrieved",
        userInfo,
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
  });
});

router.get("/info-HDV/:id", (req, res) => {
  const id = req.params.id;
  const query = "SELECT * FROM taikhoan WHERE MaTaikhoan = ?";
  dbConnect.query(query, [id], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
    if (results.length > 0) {
      const userInfo = results[0];
      return res.status(200).json({
        success: true,
        message: "User information retrieved",
        userInfo,
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
  });
});

router.post("/khachhang/update-password", (req, res) => {
  //const maTaikhoan = req.params.maTaikhoan;
  const { matKhauMoi, maTaikhoan } = req.body;
  // Kiểm tra xem matKhauMoi đã được gửi đi hay chưa
  if (!matKhauMoi) {
    return res
      .status(400)
      .json({ success: false, message: "Mật khẩu mới là bắt buộc" });
  }
  // Câu truy vấn SQL để cập nhật mật khẩu dựa trên MaTaikhoan
  const query = `UPDATE taikhoan SET MatKhau = ? WHERE MaTaikhoan = ?`;
  // Thực thi truy vấn SQL
  dbConnect.query(query, [matKhauMoi, maTaikhoan], (err, result) => {
    if (err) {
      console.error("Lỗi khi cập nhật mật khẩu:", err);
      return res
        .status(500)
        .json({ success: false, message: "Lỗi khi cập nhật mật khẩu" });
    }
    if (result.affectedRows === 0) {
      // Không có hàng nào được ảnh hưởng, có thể không có tài khoản với mã tài khoản đã cung cấp
      return res
        .status(404)
        .json({
          success: false,
          message: "Không tìm thấy tài khoản với mã tài khoản đã cung cấp",
        });
    }
    // Cập nhật mật khẩu thành công
    return res
      .status(200)
      .json({ success: true, message: "Cập nhật mật khẩu thành công" });
  });
});

const formatDate = (dateString) => {
  if (!dateString) return ""; // Trả về chuỗi rỗng nếu không có ngày tháng

  // Chuyển đổi chuỗi ngày tháng thành đối tượng Date
  const dateObject = new Date(dateString);

  // Lấy thông tin ngày, tháng, năm
  const day = String(dateObject.getDate()).padStart(2, "0");
  const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Tháng bắt đầu từ 0 nên cần cộng thêm 1
  const year = dateObject.getFullYear();

  // Format thành chuỗi "dd/MM/yyyy"
  return `${year}-${month}-${day}`;
};

router.get("/user-info/:userId", (req, res) => {
  const userId = req.params.userId;
  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "User ID not found in request" });
  }
  // Truy vấn MySQL để lấy thông tin tài khoản dựa trên userId
  const query = `SELECT * FROM taikhoan WHERE MaTaikhoan = ?`;
  dbConnect.query(query, [userId], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
    if (results.length > 0) {
      const userInfo = results[0];
      return res.status(200).json({
        success: true,
        message: "User information retrieved",
        userInfo: {
          ...userInfo,
          NgaySinh: formatDate(userInfo.NgaySinh), // Format ngày sinh thành "dd/MM/yyyy"
        },
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
  });
});

router.post("/user/:userId/avatar", upload.single("image"), (req, res) => {
  const userId = req.params.userId;
  const avatarUrl = req.file ? req.file.filename : null;

  try {
    // Kiểm tra xem file ảnh đã được gửi thành công chưa
    if (!avatarUrl) {
      return res.status(400).json({ error: "Không tìm thấy tệp ảnh" });
    }

    // Cập nhật cột avatar_url trong bảng taikhoan
    const sql = `UPDATE taikhoan SET Avatar_URL = ? WHERE MaTaikhoan = ?`;
    dbConnect.query(sql, [avatarUrl, userId], (error, results) => {
      if (error) {
        throw error;
      }
      // Trả về phản hồi thành công
      res
        .status(200)
        .json({ message: "Ảnh đã được tải lên và cập nhật thành công" });
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật ảnh đại diện:", error);
    res.status(500).json({ error: "Đã xảy ra lỗi khi xử lý yêu cầu" });
  }
});

router.put("/update/user-info", (req, res) => {
  const userInfo = req.body;
  // Query để cập nhật thông tin cá nhân trong cơ sở dữ liệu
  const query = `UPDATE taikhoan SET MatKhau=?, HoTen=?, NgaySinh=?, GioiTinh=?, LienHe=?, Email=?, DiaChi=? WHERE MaTaikhoan=?`;
  // Thực thi query
  dbConnect.query(
    query,
    [
      userInfo.MatKhau,
      userInfo.HoTen,
      userInfo.NgaySinh,
      userInfo.GioiTinh,
      userInfo.LienHe,
      userInfo.Email,
      userInfo.DiaChi,
      userInfo.MaTaikhoan,
    ],
    (err, results) => {
      if (err) {
        console.error("Error updating user info: " + err.stack);
        return res
          .status(500)
          .json({ success: false, message: "Internal Server Error" });
      }
      console.log("User info updated successfully");
      res
        .status(200)
        .json({ success: true, message: "User info updated successfully" });
    }
  );
});

router.post("/user/logout", (req, res) => {
  // Phương thức này sẽ xử lý đăng xuất người dùng
  // Ví dụ: nếu bạn đang sử dụng session, bạn có thể hủy nó ở đây
  // req.session.destroy((err) => {
  //   if (err) {
  //     console.error("Error logging out:", err);
  //     return res
  //       .status(500)
  //       .json({ success: false, message: "Error logging out" });
  //   }
  //   res.clearCookie("sessionID"); // Xóa cookie session nếu sử dụng cookie-session middleware
  //   res.json({ success: true, message: "Logout successful" });
  // });

  // Trong ví dụ này, chỉ trả về phản hồi thành công mà không xóa session hoặc cookie
  res.json({ success: true, message: "Logout successful" });
});

router.delete("/lockAccount/:id", (req, res) => {
  const userId = req.params.id;
  // Thực hiện truy vấn xóa dữ liệu từ cơ sở dữ liệu
  const sql = "DELETE FROM taikhoan WHERE MaTaikhoan = ?";
  dbConnect.query(sql, [userId], (err, result) => {
    if (err) {
      console.error("Error deleting user: " + err.stack);
      res.status(500).send("Error deleting user");
      return;
    }
    console.log("Deleted account with ID " + userId);
    res
      .status(200)
      .send({ status: true, message: "Lock account successfully" });
  });
});

module.exports = router;
