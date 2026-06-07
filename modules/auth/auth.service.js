import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

export const comparePassword = (password, hash) => {
  return bcrypt.compareSync(password, hash);
};

export const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
};
