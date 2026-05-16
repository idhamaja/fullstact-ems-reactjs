import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const session = jwt.verify(token, process.env.JWT_SECRET);

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = session; // ✅ FIX: req.session → req.user
    next();
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

export const protectAdmin = (req, res, next) => {
  if (req?.user?.role !== "ADMIN") {
    // ✅ FIX: req.session → req.user
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};
