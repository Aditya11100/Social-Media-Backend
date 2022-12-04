const express = require("express");
const connectDB = require("./config/db");
const bodyparser = require("body-parser");

const app = express();

app.use(express.json({ extended: false }));
// app.use(bodyparser.urlencoded({ extended: true }));

//Connect Database
connectDB();

app.use("/api/users", require("./routes/api/users"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/post", require("./routes/api/post"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
