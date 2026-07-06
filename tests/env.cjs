process.env.NODE_ENV = "test";
process.env.PORT = "5000";
process.env.MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ticketing_system_test";
process.env.CLIENT_ORIGIN = "http://localhost:5173";
process.env.ACCESS_TOKEN_SECRET = "test-access-secret-at-least-32-characters";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-at-least-32-characters";
process.env.ACCESS_TOKEN_TTL = "15m";
process.env.REFRESH_TOKEN_TTL_DAYS = "7";
