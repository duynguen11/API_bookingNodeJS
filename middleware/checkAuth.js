const jwt = require('jsonwebtoken');

const authToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Token không tồn tại' });
  
    const tokenWithoutBearer = token.split(' ')[1];
    // Giải mã token
    jwt.verify(tokenWithoutBearer, 'your_secret_key', (err, decodedToken) => {
      if (err) {
        // Xử lý khi token không hợp lệ
        return res.status(403).json({ error: 'Token không hợp lệ' });
      } else {
        // Lưu thông tin người dùng từ token vào req.user
        req.user = decodedToken;
        // Ghi log token đã được giải mã
        console.log('Token đã được xác thực và giải mã:', decodedToken);
        next();
      }
    });
  };

module.exports = authToken;