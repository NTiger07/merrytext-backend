const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("../models/User");
const Transaction = require("../models/Transaction");
const UserStats = require("../models/UserStats");
const ApiResponse = require("../utils/ApiResponse");

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
  const user = await User.findOne({ username: ownerUsername });

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
    throw new Error("Transaction not found");
  }

  // Check if already completed
  if (transaction.status === "completed") {
    console.log("Transaction already completed");
    return;
  }

  // Find user and add coins
  const user = await User.findOne({ username });

  if (!user) {
    throw new Error("User not found");
  }

  const coinsToAdd = parseInt(coins);
  user.merryCoins += coinsToAdd;
  await user.save();

  // Update transaction status
  transaction.status = "completed";
  await transaction.save();

  // Update user stats
  await UserStats.findOneAndUpdate(
    { userId: user._id },
    { $inc: { totalCoinsEarned: coinsToAdd } },
    { upsert: true }
  );

  console.log(`✅ Payment completed: ${coinsToAdd} coins added to ${username}`);
}

module.exports = { ...exports, completePayment };
