const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const ApiResponse = require("../utils/ApiResponse");
const {
  awardXpToUserByUsername,
  getXpForAction,
} = require("../services/xpService");
const {
  checkAchievementsByCategory,
} = require("../services/achievementService");

/**
 * Create Stripe checkout session
 */
exports.createCheckoutSession = async (req, res) => {
  const { ownerUsername, ownerEmail, amount, coins, priceId } = req.body;

  // Validate inputs
  if (!ownerUsername || !ownerEmail) {
    return res
      .status(400)
      .json(ApiResponse.error("Username and email are required"));
  }

  if (!amount || amount <= 0) {
    return res
      .status(400)
      .json(ApiResponse.error("Amount must be greater than 0"));
  }

  // Find user
  const user = await User.findOne({ username: ownerUsername }).populate(
    "achievements.achievementId"
  );

  if (!user) {
    return res.status(404).json(ApiResponse.error("User not found"));
  }

  try {
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${coins} MerryCoins`,
              description: `Purchase ${coins} MerryCoins for MerryText`,
            },
            unit_amount: amount, // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      customer_email: ownerEmail,
      metadata: {
        username: ownerUsername,
        email: ownerEmail,
        coins: coins.toString(),
      },
    });

    // Create pending transaction
    await Transaction.create({
      ownerUsername,
      ownerEmail,
      stripePaymentIntentId: session.id,
      amount,
      coinsPurchased: coins,
      status: "pending",
    });

    const result = {
      sessionId: session.id,
      url: session.url,
      amount,
      coins,
      user: {
        username: user.username,
        name: user.name,
        level: user.level,
        totalXp: user.totalXp,
        merryCoins: user.merryCoins,
        stats: user.stats,
        achievements: user.achievements,
      },
    };

    res.json(ApiResponse.success(result, "Checkout session created"));
  } catch (error) {
    console.error("Stripe error:", error);
    res
      .status(500)
      .json(
        ApiResponse.error("Failed to create checkout session: " + error.message)
      );
  }
};

/**
 * Verify payment session
 */
exports.verifyPaymentSession = async (req, res) => {
  const { sessionId } = req.params;
  const { username } = req.query;

  if (!sessionId) {
    return res.status(400).json(ApiResponse.error("Session ID is required"));
  }

  try {
    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Find transaction in database
    const transaction = await Transaction.findOne({
      stripePaymentIntentId: sessionId,
    });

    if (!transaction) {
      return res.status(404).json(ApiResponse.error("Transaction not found"));
    }

    // Verify username if provided
    if (username && transaction.ownerUsername !== username) {
      return res
        .status(403)
        .json(ApiResponse.error("Unauthorized to view this transaction"));
    }

    // If payment is complete but transaction is still pending, complete it now
    if (session.payment_status === "paid" && transaction.status === "pending") {
      await completePayment(session);
    }

    // Refresh transaction from database to get updated status
    const updatedTransaction = await Transaction.findOne({
      stripePaymentIntentId: sessionId,
    });

    // Get updated user data AFTER completing payment
    const user = await User.findOne({
      username: updatedTransaction.ownerUsername,
    })
      .select("-password")
      .populate("achievements.achievementId");

    const result = {
      sessionId: session.id,
      paymentStatus: session.payment_status,
      transactionStatus: updatedTransaction.status,
      amount: updatedTransaction.amount,
      coinsPurchased: updatedTransaction.coinsPurchased,
      completedAt: updatedTransaction.completedAt,
      user: user
        ? {
            username: user.username,
            name: user.name,
            merryCoins: user.merryCoins,
            level: user.level,
            totalXp: user.totalXp,
            stats: user.stats,
            achievements: user.achievements,
          }
        : null,
    };

    res.json(ApiResponse.success(result, "Payment session verified"));
  } catch (error) {
    console.error("Payment verification error:", error);
    res
      .status(500)
      .json(ApiResponse.error("Failed to verify payment: " + error.message));
  }
};

/**
 * Handle Stripe webhook
 */
exports.handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      await completePayment(session);
    } catch (error) {
      console.error("Failed to process payment:", error);
      return res.status(500).json({ error: "Failed to process payment" });
    }
  }

  res.json({ received: true });
};

/**
 * Complete payment and add coins to user
 */
async function completePayment(session) {
  const { username, coins } = session.metadata;
  const sessionId = session.id;

  // Find transaction
  const transaction = await Transaction.findOne({
    stripePaymentIntentId: sessionId,
  });

  if (!transaction) {
    console.error(`❌ Transaction not found for session: ${sessionId}`);
    throw new Error("Transaction not found");
  }

  // Check if already completed
  if (transaction.status === "completed") {
    return;
  }

  // Find user and add coins
  const user = await User.findOne({ username });

  if (!user) {
    console.error(`❌ User not found: ${username}`);
    throw new Error("User not found");
  }

  const coinsToAdd = parseInt(coins);

  // Update coins and stats
  user.merryCoins += coinsToAdd;
  user.stats.totalCoinsEarned += coinsToAdd;

  // Save and wait for confirmation
  const savedUser = await user.save();

  // Award XP for purchasing coins
  try {
    await awardXpToUserByUsername(
      user.username,
      getXpForAction("PURCHASE_COINS")
    );
  } catch (err) {
    console.error("Failed to award XP for coin purchase:", err.message);
  }

  // Check and unlock coin achievements
  try {
    await checkAchievementsByCategory(user.username, "coins");
  } catch (err) {
    console.error("Failed to check achievements:", err.message);
  }

  // Update transaction status
  transaction.status = "completed";
  transaction.completedAt = new Date();
  await transaction.save();
}

module.exports = { ...exports, completePayment };
