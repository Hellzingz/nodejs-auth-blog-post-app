import { Router } from "express";
import { db } from "../utils/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  try {
    const { username, password, firstName, lastName } = req.body;
    const collection = db.collection("users");
    const existingUser = await collection.findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: "Username is already existed." });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await collection.insertOne({
      username: username,
      password: hashedPassword,
      firstName: firstName,
      lastName: lastName,
    });
    res.status(201).json({ message: "Register Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const collection = db.collection("users");
    const user = await collection.findOne({ username });
    if (!user)
      return res.status(401).json({ message: "Invalid username or password" });
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid)
      return res.status(401).json({ message: "Invalid username or password" });
    const token = jwt.sign(
      { id: user._id, firstName: user.firstName, lastName: user.lastName },
      process.env.SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.status(200).json({ message: "Login Successfully", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

export default authRouter;
