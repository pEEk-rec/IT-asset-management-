const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
const assetRoutes = require("./routes/assetRoutes");
const authRoute = require("./routes/auth");
// const MaintenanceRoutes = require("./routes/MaintenanceRoutes");
const adminRoutes = require("./routes/AdminUsers");
const assignmentRoutes = require('./routes/assignmentRoutes');
const employee = require('./routes/employee');
const AdminUser = require('./models/AdminUser');


const Assignment = require('./models/Assignment');


app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

// Health check endpoint (public - no auth required)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Load test endpoint (public - for HPA demo)
app.get('/api/load-test', (req, res) => {
  // CPU-intensive calculation to simulate load
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += Math.sqrt(i) * Math.sin(i);
  }
  res.json({ status: 'ok', result: result });
});

app.use("/api", assetRoutes);
app.use("/api", authRoute);
// app.use('/api/maintenance', MaintenanceRoutes);// Ensure this route is used
app.use("/api", adminRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api', employee);


app.post('/api/users', async (req, res) => {
  try {
    console.log(req.body)
    const newUser = new AdminUser(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});



app.post('/api/assignments', async (req, res) => {
  const { userId, assetId, assignmentDate, status } = req.body;
  try {
    const newAssignment = new Assignment({ userId, assetId, assignmentDate, status });
    await newAssignment.save();
    res.status(201).json(newAssignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});







const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

mongoose.connect(process.env.MONGODB_URI);

const database = mongoose.connection;

database.on("error", (error) => {
  console.log(error);
});

database.once("connected", () => {
  console.log("Database Connected");
});
