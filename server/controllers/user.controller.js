const { prisma } = require("../prisma/prisma-client");
const bcrypt = require("bcryptjs");
const Jdenticon = require("jdenticon");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");

const UserController = {
  //registration
  register: async (req, res) => {
    const { email, password, name } = req.body;

    // Проверяем поля на существование
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Все поля обязательны" });
    }

    try {
      // Проверяем, существует ли пользователь с таким emai
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: "Пользователь уже существует" });
      }

      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(password, 10);

      // Генерируем аватар для нового пользователя
      const png = Jdenticon.toPng(name, 200);
      const avatarName = `${name}_${Date.now()}.png`;
      const avatarPath = path.join(__dirname, "/../uploads", avatarName);
      fs.writeFileSync(avatarPath, png);

      // Создаем пользователя
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          avatarUrl: `/uploads/${avatarName}`,
        },
      });

      res.json(user);
    } catch (error) {
      console.error("Error in register:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  //login
  login: async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Все поля обязательны" });
    }

    try {
      const user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        return res.status(400).json({ error: "Неверный логин или пароль" });
      }
      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return res.status(400).json({ error: "Неверный логин или пароль" });
      }

      const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY);

      res.json({ token });
    } catch (error) {
      console.error("Login error", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  //получить пользователя по Id
  getUserById: async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;

    try {
      const user = await prisma.user.findUnique({
        where: { id },
      });
      if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      res.json({ ...user });
    } catch (error) {
      console.error("Get Current Error", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  //update
  updateUser: async (req, res) => {
    const { id } = req.params;
    const { email, name } = req.body;

    let filePath;

    if (req.file && req.file.path) {
      filePath = req.file.path;
    }

    // Проверка, что пользователь обновляет свою информацию
    if (id !== req.user.userId) {
      return res.status(403).json({ error: "Нет доступа" });
    }

    try {
      let existingUser;

      if (email) {
        existingUser = await prisma.user.findFirst({
          where: { email },
        });

        if (existingUser && existingUser.id !== parseInt(id)) {
          return res.status(400).json({ error: "Почта уже используется" });
        }
      }

      console.log("Email:", email);
      console.log("ID:", id);
      console.log("Existing user:", existingUser);

      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          email: email || undefined,
          name: name || undefined,
          avatarUrl: filePath ? `/${filePath}` : undefined,
        },
      });

      res.json(updatedUser);
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ error: "Что-то пошло не так" });
    }
  },

  current: async (req, res) => {
    res.send("current");
  },
};
module.exports = UserController;
