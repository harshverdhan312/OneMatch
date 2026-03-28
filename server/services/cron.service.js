const cron = require('node-cron');
const matchService = require('./match.service');

const startCronJobs = () => {
  // Run every midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily match generation cron job...');
    try {
      await matchService.generateMatches();
    } catch (error) {
      console.error('Error generating matches via cron:', error);
    }
  });
  
  // Run every hour to process check-ins
  cron.schedule('0 * * * *', async () => {
    console.log('Running check-in processing cron job...');
    try {
      await matchService.processCheckIns();
    } catch (error) {
      console.error('Error processing check-ins via cron:', error);
    }
  });

  console.log('Cron jobs scheduled.');
};

module.exports = { startCronJobs };
