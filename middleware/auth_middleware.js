const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // 1. Check if header exists
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // 2. Extract token
  const token = authHeader.split(' ')[1];

  try {
    // 3. Verify token
    const decoded = jwt.verify(token.trim(), process.env.SECRET_KEY);

    // 4. Attach user info to request
    req.user = decoded;
    // 5. Continue
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token',debugg : error.message });
  }
};

const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};
module.exports = {authMiddleware,allowRoles};