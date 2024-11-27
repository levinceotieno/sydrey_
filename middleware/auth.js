const jwt = require('jsonwebtoken');

// Authenticate User Middleware
const authenticateUser = (req, res, next) => {
  // Check session for user info
  if (req.session.user) {
    req.user = req.session.user; // Use session data
    return next();
  }

  // If no session, check for token
  const token = req.headers.authorization?.split(' ')[1]; // Get token from header
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to the request object
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid token.' });
  }
};

// Authorize Role Middleware
const authorizeRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ error: `Access denied. Requires ${role} role.` });
  }
  next();
};

module.exports = { authenticateUser, authorizeRole };
