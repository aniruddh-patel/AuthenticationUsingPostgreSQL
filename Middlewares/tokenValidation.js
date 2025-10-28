import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    const values = jwt.verify(token, process.env.JWT_SECRET);
    req.user = values;
    next();
  } catch (err) {
    console.error(err);
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};