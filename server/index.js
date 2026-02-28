require("dotenv").config();
const express = require("express");
const cors = require("cors");
const reviewRoute = require("./routes/review");

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "Vericode server running" });
});

app.use("/review", reviewRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
