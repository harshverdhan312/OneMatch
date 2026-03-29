require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { startCronJobs } = require('./services/cron.service');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      startCronJobs();
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
