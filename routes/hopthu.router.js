const express = require("express");
const router = express.Router();
const hopthuController = require('../controllers/hopthu.controller');
const dbConnect = require("../config/db.config");

router.get('/', hopthuController.getHopthu)
router.put('/updateStatus', hopthuController.updateTrangthai)

router.get('/getMessagesByIdAccount/:id', (req, res) => {
    try {
      const { id } = req.params;
  
      const sql = `
      SELECT hopthu.*, phanhoi.*
      FROM hopthu
      INNER JOIN phanhoi ON hopthu.Mahopthu = phanhoi.Mahopthu
      WHERE hopthu.Mataikhoan = ?`;
  
      dbConnect.query(sql, [id], (err, result) => {
        if (err) {
          console.error('Error querying data:', err);
          res.status(500).json({ message: 'An error occurred while querying data.' });
        } else {
          res.status(200).json(result);
        }
      });
    } catch (error) {
      console.error('Error handling request:', error);
      res.status(500).json({ message: 'An error occurred while handling the request.' });
    }
  });

router.post('/reply', async (req, res) => {
    try {
      const { mahopthu, noidung } = req.body;
      // Cập nhật tin nhắn mới vào cơ sở dữ liệu
      console.log('nội dung gửi:', req.body)
      const thoigian = new Date().toISOString().slice(0, 19).replace("T", " ");
      const sql = 'INSERT INTO phanhoi (noidung, thoigianphanhoi, mahopthu) VALUES (?, ?, ?)';
      const values = [noidung, thoigian, mahopthu];

      dbConnect.query(sql, values, (err, result) => {
        if (err) {
          console.error('Lỗi khi cập nhật tin nhắn:', err);
          res.status(500).json({ message: 'Có lỗi xảy ra khi gửi phản hồi.' });
        } else {
          res.status(200).json({ message: 'Phản hồi đã được gửi thành công.' });
        }
      });
    } catch (error) {
      console.error('Lỗi khi gửi phản hồi:', error);
      res.status(500).json({ message: 'Có lỗi xảy ra khi gửi phản hồi.' });
    }
  });

module.exports = router