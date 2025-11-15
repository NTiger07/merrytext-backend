const Transaction = require("../models/Transaction");

/**
 * Mark pending transactions as failed after timeout period
 * @param {number} hoursTimeout - Number of hours after which to mark as failed (default: 12)
 */
async function markExpiredTransactionsAsFailed(hoursTimeout = 12) {
  try {
    const timeoutDate = new Date();
    timeoutDate.setHours(timeoutDate.getHours() - hoursTimeout);

    const result = await Transaction.updateMany(
      {
        status: "pending",
        createdAt: { $lt: timeoutDate },
      },
      {
        $set: {
          status: "failed",
          completedAt: new Date(),
        },
      }
    );

    if (result.modifiedCount > 0) {
      console.log(
        `[Transaction Cleanup] Marked ${result.modifiedCount} pending transactions as failed`
      );
    }

    return result;
  } catch (error) {
    console.error("[Transaction Cleanup] Error:", error);
    throw error;
  }
}

/**
 * Start periodic cleanup job
 * @param {number} intervalMinutes - How often to run cleanup (default: 60 minutes)
 * @param {number} hoursTimeout - Hours before marking as failed (default: 12)
 */
function startTransactionCleanupJob(intervalMinutes = 60, hoursTimeout = 12) {
  console.log(
    `[Transaction Cleanup] Starting cleanup job - checking every ${intervalMinutes} minutes for transactions older than ${hoursTimeout} hours`
  );

  // Run immediately on startup
  markExpiredTransactionsAsFailed(hoursTimeout);

  // Then run periodically
  setInterval(() => {
    markExpiredTransactionsAsFailed(hoursTimeout);
  }, intervalMinutes * 60 * 1000);
}

module.exports = {
  markExpiredTransactionsAsFailed,
  startTransactionCleanupJob,
};
