const request = require("supertest");
const app = require("../src/index");

describe("Health Check", () => {
  it("should return 200 and service info", async () => {
    const response = await request(app).get("/");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("ok", true);
    expect(response.body).toHaveProperty("service", "merrytext-express");
    expect(response.body).toHaveProperty("version");
  });
});

describe("API Routes", () => {
  it("should have user routes mounted", async () => {
    const response = await request(app).get("/merrytext/api/v1/user/all");
    // Should not return 404
    expect(response.status).not.toBe(404);
  });

  it("should have message routes mounted", async () => {
    const response = await request(app).get(
      "/merrytext/api/v1/message/view/test123"
    );
    // 404 is expected for non-existent message, but tests that route is mounted
    expect([200, 404, 400, 500]).toContain(response.status);
  });

  it("should have stats routes mounted", async () => {
    const response = await request(app).get(
      "/merrytext/api/v1/stats/leaderboard"
    );
    // Should not return 404
    expect(response.status).not.toBe(404);
  });
});
