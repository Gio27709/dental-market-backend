const express = require("express");
const cors = require("cors");
const testRoutes = require("./routes/test.routes.cjs");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", testRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.send("Server is running correctly!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
