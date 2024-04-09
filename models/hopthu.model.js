var dbConnect = require("../config/db.config");

var hopthu = function (hopthu) {
  this.mahopthu = hopthuModel.mahopthu;
  this.hoten = hopthuModel.hoten;
  this.email = hopthuModel.lienhe;
  this.tinnhan = hopthuModel.tinnhan;
  this.thoigiangui = hopthuModel.thoigiangui;
  this.trangthai = hopthuModel.trangthai;
};

hopthu.getAllHopthu = function (data) {
  const sql = `SELECT hopthu.*, taikhoan.*
    FROM hopthu
    LEFT JOIN taikhoan ON hopthu.MaTaikhoan = taikhoan.MaTaikhoan AND taikhoan.PhanLoaiTK = 'thành viên';`;
  dbConnect.query(sql, (err, res) => {
    if (err) {
      data(err, null); // Trả về lỗi cho controller
      return;
    }

    data(null, res);
  });
};

hopthu.updateTrangthaiMoi = function (mahopthu, trangthai, data) {
    const sql = `UPDATE hopthu SET trangthai = ? WHERE mahopthu = ?`
    const values = [trangthai, mahopthu];
    dbConnect.query(sql, values, (err, res) => {
        if (err) {
            data(err, null); // Trả về lỗi cho controller
            return;
          }
          data(null, res);
    })
}

module.exports = hopthu;
