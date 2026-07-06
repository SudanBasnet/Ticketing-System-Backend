module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  setupFiles: ["<rootDir>/tests/env.cjs"],
  testMatch: ["**/*.test.cjs"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.cjs"]
};
