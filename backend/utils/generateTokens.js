import jwt from 'jsonwebtoken'

export const generateAccessTokens = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m'
  });
};

export const generateRefreshTokens = (userId) => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '30d'
  });
};