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
  console.log('Cron jobs scheduled.');
};

module.exports = { startCronJobs };
