export const validateSignup = (req, res, next) => {
  const { fullName, email, password, role } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password should be at least 6 characters long" });
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: "Valid email is required" });
  }

  // Optional: Validate role if provided
  if (role && !['customer', 'restaurant', 'admin'].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  next();
}

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  next();
}