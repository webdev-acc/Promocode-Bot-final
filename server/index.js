const express = require("express");
const cors = require("cors");
const app = express();
const bannerRoutes = require("./project/routes/banerRoutes");
const userRoutes = require("./project/routes/userRoutes");
const tagRoutes = require("./project/routes/tagRoutes");

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use("/", bannerRoutes);
app.use("/", userRoutes);
app.use("/", tagRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
