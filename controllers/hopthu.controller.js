const hopthuModel = require("../models/hopthu.model");

exports.getHopthu = (req, res) => {
  hopthuModel.getAllHopthu((err, data) => {
    if (err) {
      // Xử lý lỗi trả về từ model
      return res.status(500).json({ status: false, message: "Lỗi server" });
    }
    // Nếu không có lỗi, xử lý kết quả thành công
    return res.status(200).json({ status: true, data: data });
  });
};

exports.updateTrangthai = (req, res) => {
  const { mahopthu, trangthai } = req.body;
  hopthuModel.updateTrangthaiMoi(mahopthu, trangthai, (err, data) => {
    if (err) {
      // Xử lý lỗi nếu có
      res
        .status(500)
        .json({ message: "Có lỗi xảy ra khi cập nhật trạng thái." });
    } else {
      // Trả về phản hồi thành công nếu không có lỗi
      res.status(200).json({ message: "Cập nhật trạng thái thành công." });
    }
  });
};
