const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

//Midleware
app.use(cors());
app.use(express.json());

//MonggoDB conection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

//Routes
const userRoutes = require("./routes/users");
const categoryRoutes = require("./routes/categories");
const itemRoutes = require("./routes/items");

app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/items", itemRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "server is running",
    status: "ok",
    timestamp: new Date(),
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

const PORT = process.env.PORT || 5006;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
