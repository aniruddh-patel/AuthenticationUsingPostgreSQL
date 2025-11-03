import jwt from "jsonwebtoken";

export const UserAuthToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token)
    return res.status(401).json({ error: "Authentication required" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      user_id: payload.user_id,
      user_name: payload.user_name,
      user_email: payload.user_email,
    };

    next();
  } catch (err) {
    console.error(err);
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

export const SellerAuthToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);    
    req.seller = {
      seller_id: payload.seller_id,
      seller_name: payload.seller_name,
      shop_name:payload.shop_name,
      seller_email: payload.seller_email,
      account_type: payload.account_type
    };
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    res.status(403).json({ error: "Invalid or expired token" });
  }
};