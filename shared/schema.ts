import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const strategies = pgTable("strategies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  // Config stores indicators (e.g., RSI, EMA), thresholds, and logic
  config: json("config").notNull(), 
  active: boolean("active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const riskSettings = pgTable("risk_settings", {
  id: serial("id").primaryKey(),
  maxDailyLoss: integer("max_daily_loss").notNull().default(100),
  tradeSize: integer("trade_size").notNull().default(10),
  dailyStopLoss: integer("daily_stop_loss").default(50),
  takeProfit: integer("take_profit").default(200),
  // Stored as text to handle decimals accurately, parsed in app/bot
  martingaleMultiplier: text("martingale_multiplier").default("1.0"), 
  active: boolean("active").default(true),
});

export const tradeLogs = pgTable("trade_logs", {
  id: serial("id").primaryKey(),
  strategyId: integer("strategy_id"), // Can be null if manual or unknown
  symbol: text("symbol").notNull(),
  action: text("action").notNull(), // BUY, SELL
  amount: integer("amount").notNull(),
  price: text("price"),
  result: text("result"), // WIN, LOSS, PENDING
  screenshotUrl: text("screenshot_url"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// === SCHEMAS ===

export const insertStrategySchema = createInsertSchema(strategies).omit({ 
  id: true, 
  createdAt: true 
});

export const insertRiskSettingsSchema = createInsertSchema(riskSettings).omit({ 
  id: true 
});

export const insertTradeLogSchema = createInsertSchema(tradeLogs).omit({ 
  id: true, 
  timestamp: true 
});

// === TYPES ===

export type Strategy = typeof strategies.$inferSelect;
export type InsertStrategy = z.infer<typeof insertStrategySchema>;

export type RiskSettings = typeof riskSettings.$inferSelect;
export type InsertRiskSettings = z.infer<typeof insertRiskSettingsSchema>;

export type TradeLog = typeof tradeLogs.$inferSelect;
export type InsertTradeLog = z.infer<typeof insertTradeLogSchema>;

// === API TYPES ===

export type CreateStrategyRequest = InsertStrategy;
export type UpdateStrategyRequest = Partial<InsertStrategy>;

export type UpdateRiskSettingsRequest = Partial<InsertRiskSettings>;

// For the bot to report trades
export type CreateTradeLogRequest = InsertTradeLog; 

export type BotScriptResponse = {
  script: string;
  filename: string;
};
