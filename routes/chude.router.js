const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/checkAuth");
var dbConnect = require("../config/db.config");

const chudeController = require("../controllers/chude.controller");

router.get("/", chudeController.getChuDe);
router.get("/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM chude WHERE MaChuDe = ?";
  dbConnect.query(sql, [id], (err, result) => {
    if (err) return res.json({ Status: false, Error: "Query error" + err });
    return res.json({ Status: true, Result: result });
  });
});
router.post("/create", chudeController.createChuDe);
router.put("/update/:id", chudeController.updateChuDe);

router.delete("/delete/:MaChuDe", checkAuth, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Chỉ có quản trị viên mới được phép truy cập vào route này' });
  }

  const MaChuDe = req.params.MaChuDe;
  const checkQuery = "SELECT COUNT(*) AS tourCount FROM tour WHERE MaChuDe = ?";

  dbConnect.query(checkQuery, [MaChuDe], (err, result) => {
    if (err) {
      console.log("Error while checking for associated tours:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    const tourCount = result[0].tourCount;

    if (tourCount > 0) {
      return res
        .status(400)
        .json({ error: "Đang có dữ liệu tour, không thể xóa danh mục" });
    } else {
      const deleteQuery = "DELETE FROM chude WHERE MaChuDe = ?";
      dbConnect.query(deleteQuery, [MaChuDe], (err, result) => {
        if (err) {
          console.log("Error while deleting ChuDe:", err);
          return res.status(500).json({ error: "Internal server error" });
        }
        return res.json({ message: "ChuDe deleted successfully" });
      });
    }
  });
});

module.exports = router;
