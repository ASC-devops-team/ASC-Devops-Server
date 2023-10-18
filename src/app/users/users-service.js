const Store = require("./users-store");
const Logs = require("../logs/logs-store");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userId = 1;
require("dotenv").config();
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../../middlewares/errors");
const moduleName = "Authentication";

class UserService {
  constructor(db) {
    this.db = db;
  }

  // Login User
  async login(req, res, next) {
    try {
      const store = new Store(req.db);
      const logs = new Logs(req.db);
      // const { email, password } = req.body;
      const body = req.body;
      if (!body.email || !body.password) {
        throw new BadRequestError("Email and password are required");
      }
      const user = await store.getUsername(body.email);
      if (!user) {
        throw new NotFoundError("Email not found");
      }
      const validPassword = await bcrypt.compare(body.password, user.password);
      if (!validPassword) {
        throw new UnauthorizedError("Invalid password");
      }
      // Create a JWT token
      const accessToken = jwt.sign(
        {
          UserInfo: {
            email: user.email,
            access_level: user.access_level,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "30s" }
      );
      const refreshToken = jwt.sign(
        { email: user.email },
        process.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: "30s",
        }
      );

      store.updateRefreshToken(user.uuid, user, refreshToken);

      const updatedUser = await store.getUsername(body.email);

      logs.add({
        uuid: user.uuid,
        module: moduleName,
        action: "signed in",
        ...body,
      });

      return res
        .cookie("jwt", refreshToken, {
          httpOnly: true,
          // Set sameSite to "None" and secure to "true" if deployed.
          // Otherwise, set it to "Strict" and comment out secure
          sameSite: "Strict",
          // secure: true,
          maxAge: 30 * 1000,
        })
        .send({
          success: true,
          message: "Login successful",
          data: { ...updatedUser, accessToken },
        });
    } catch (err) {
      next(err);
    }
  }

  // Register new user
  async register(req, res, next) {
    try {
      const store = new Store(req.db);
      const logs = new Logs(req.db);
      const body = req.body;
      //const userId = req.auth.id; // Get user ID using auth
      // Hash the password
      const hash = await bcrypt.hash(body.password, 10);
      // Validate input
      if (!body.email || !body.password) {
        throw new BadRequestError("Email and password are required");
      }
      // Check if the user already exists
      const hasUser = await store.getUsername(body.email);
      if (hasUser) {
        throw new BadRequestError("Email already exists");
      }
      // Insert the new user into the database
      const result = await store.registerUser(body, hash);
      const uuid = result[0];
      // Create a new object without the "password" property
      const userData = { ...body };
      delete userData.password;
      logs.add({
        uuid: userId,
        module: moduleName,
        data: userData,
        action: "registered an account",
        ...body,
      });
      return res.status(201).send({
        success: true,
        message: "Registration Complete",
        data: {
          uuid: uuid,
          ...userData,
          password: hash,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // password verification by user uuid
  async password(req, res, next) {
    try {
      const store = new Store(req.db);
      const body = req.body;
      const result = await store.getUserByUUID(body.uuid);
      if (!result) {
        throw new NotFoundError("User not found");
      }
      const validPassword = await bcrypt.compare(
        body.password,
        result.password
      );
      if (!validPassword) {
        throw new BadRequestError("Invalid password, please try again");
      }
      res.status(200).send({ success: true, message: "Successfully Updated" });
    } catch (error) {
      next(error);
    }
  }

  // Get all users
  async getData(req, res, next) {
    try {
      const store = new Store(req.db);
      let result = [];
      result = await store.getData();
      return res.status(200).send({
        success: true,
        message: "Data retrieved successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // Get user by QR CODE
  async userByQR(req, res, next) {
    try {
      const store = new Store(req.db);
      const qrCode = req.query.qr_code;
      const result = await store.getUserByQR(qrCode);
      if (!result) {
        throw new NotFoundError("Resource not found, QR code not registered.");
      }
      return res.status(200).send({
        success: true,
        message: "Data retrieved successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // Update user
  async updateUser(req, res, next) {
    try {
      const store = new Store(req.db);
      const logs = new Logs(req.db);
      const uuid = req.params.uuid;
      const body = req.body;
      // Hash the password
      if (body.password) {
        body.password = await bcrypt.hash(body.password, 10);
      }
      const result = store.updateUser(uuid, body);
      if (result === 0) {
        throw new NotFoundError("User not found");
      }
      const userData = { ...body };
      delete userData.password;
      logs.add({
        uuid: userId,
        module: moduleName,
        data: userData,
        action: "updated an account",
        ...body,
      });
      return res.status(200).send({
        success: true,
        message: "Successfully Updated",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const store = new Store(req.db);
      const users = await store.getAll();

      const cookies = req.cookies;
      if (!cookies?.jwt) return res.sendStatus(204);
      const refreshToken = cookies.jwt;

      const foundUser = await users.find(
        (user) => user.refresh_token === refreshToken
      );

      if (!foundUser) {
        res.clearCookie("jwt", {
          httpOnly: true,
          sameSite: "None",
          secure: true,
        });
        return res.sendStatus(204);
      }

      store.updateRefreshToken(foundUser.uuid, foundUser, null);

      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      res.sendStatus(204);
    } catch (err) {
      next(err);
    }
  }

  async refresh(req, res, next) {
    try {
      const store = new Store(req.db);
      const users = await store.getAll();

      const cookies = req.cookies;
      if (!cookies?.jwt)
        return res.status(401).json({ message: "Unauthorized" });
      const refreshToken = cookies.jwt;

      const foundUser = await users.find(
        (user) => user.refresh_token === refreshToken
      );

      if (!foundUser) return res.sendStatus(403); // Forbidden

      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        (err, decoded) => {
          if (err || foundUser.email !== decoded?.email) {
            console.log(err);
            return res.sendStatus(403);
          }
          const accessToken = jwt.sign(
            {
              email: decoded.email,
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "30s" }
          );
          return res.json({ accessToken });
        }
      );
    } catch (err) {
      next(err);
    }
  }

  // Delete a user
  // async delete(req, res, next) {
  //   try {
  //     const store = new Store(req.db);
  //     const uuid = req.params.uuid;
  //     const result = await store.deleteUser(uuid);
  //     if (result === 0) {
  //       throw new NotFoundError('User not found');
  //     }
  //     logs.add({
  //       uuid: user.uuid,
  //       module: moduleName,
  //       action: "deleted an account",
  //       ...body
  //     })
  //     return res.status(202).send({
  //       success: true,
  //       message: 'User has been deleted'
  //     });
  //   } catch (err) {
  //     next(err);
  //   }
  // }
}

module.exports = UserService;
