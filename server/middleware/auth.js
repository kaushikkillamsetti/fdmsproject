const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fdms_cybersecurity_quantum_secret_key_2026_jwt_token_auth';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.user_type)) {
      return res.status(403).json({ 
        error: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}` 
      });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole,
  JWT_SECRET,
};
