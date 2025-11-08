const mongoose = require("mongoose");

// Close MongoDB connection after all tests
afterAll(async () => {
  await mongoose.connection.close();
});
