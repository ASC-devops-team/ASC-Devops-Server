const refreshToken = (req, res, next) => {
  const jwt = require("jsonwebtoken");
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);

  const refreshToken = cookies.jwt;

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err || foundUser.email !== decoded.email) {
      return res.sendStatus(403);
    }

    const accessToken = jwt.sign(
      { email: decoded.email },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "30s",
      }
    );

    res.status(200).json({ accessToken });

    next();
  });
};

module.exports = refreshToken;
