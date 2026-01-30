const express = require("express");
const router = express.Router();

// GET /api/test/ping
router.get("/ping", (req, res) => {
  res.json({ message: "pong", timestamp: new Date() });
});

// GET /api/test/users
router.get("/users", (req, res) => {
  const users = [
    { id: 1, name: "Alice", role: "Admin" },
    { id: 2, name: "Bob", role: "User" },
    { id: 3, name: "Charlie", role: "User" },
  ];
  res.json(users);
});

module.exports = router;
