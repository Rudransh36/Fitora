/**
 * Seed data is DISABLED for production.
 * Real users get zero-state dashboards on registration.
 * The demo account (alex@Fitora.io) is NOT auto-created anymore.
 */

/**
 * No-op stub – seeding is disabled.
 * A new user sees clean zero-state data on their first login.
 */
async function seedDefaultData() {
  // Seeding intentionally disabled.
  // Every real user starts with empty data — no demo records injected.
  console.log('ℹ️  Fitora: Auto-seeding is disabled. New users start with clean zero-state data.');
}

module.exports = { seedDefaultData };
