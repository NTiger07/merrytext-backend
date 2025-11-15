const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

async function fixTransactionIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/merrytext"
    );
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;
    const transactionsCollection = db.collection("transactions");

    // Get all indexes
    const indexes = await transactionsCollection.indexes();
    console.log("\n📋 Current indexes:");
    indexes.forEach((index) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    // Drop the old unique index on stripePaymentIntentId
    try {
      await transactionsCollection.dropIndex("stripePaymentIntentId_1");
      console.log("\n✅ Dropped old unique index: stripePaymentIntentId_1");
    } catch (error) {
      if (error.code === 27) {
        console.log(
          "\n⚠️  Index stripePaymentIntentId_1 doesn't exist (already dropped)"
        );
      } else {
        throw error;
      }
    }

    // Create new sparse index
    await transactionsCollection.createIndex(
      { stripePaymentIntentId: 1 },
      { sparse: true, name: "stripePaymentIntentId_1_sparse" }
    );
    console.log("✅ Created new sparse index: stripePaymentIntentId_1_sparse");

    // Show updated indexes
    const updatedIndexes = await transactionsCollection.indexes();
    console.log("\n📋 Updated indexes:");
    updatedIndexes.forEach((index) => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key));
    });

    console.log("\n✅ Index migration completed successfully!");
  } catch (error) {
    console.error("❌ Error fixing index:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("👋 Disconnected from MongoDB");
    process.exit(0);
  }
}

fixTransactionIndex();
