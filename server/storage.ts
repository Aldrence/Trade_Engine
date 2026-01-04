import { db } from "./db";
import {
  strategies,
  riskSettings,
  tradeLogs,
  type InsertStrategy,
  type InsertRiskSettings,
  type InsertTradeLog,
  type Strategy,
  type RiskSettings,
  type TradeLog
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Strategies
  getStrategies(): Promise<Strategy[]>;
  getStrategy(id: number): Promise<Strategy | undefined>;
  createStrategy(strategy: InsertStrategy): Promise<Strategy>;
  updateStrategy(id: number, updates: Partial<InsertStrategy>): Promise<Strategy>;
  deleteStrategy(id: number): Promise<void>;
  
  // Risk Settings
  getRiskSettings(): Promise<RiskSettings | undefined>;
  updateRiskSettings(settings: InsertRiskSettings): Promise<RiskSettings>;

  // Logs
  getLogs(): Promise<TradeLog[]>;
  createLog(log: InsertTradeLog): Promise<TradeLog>;
  clearLogs(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Strategies
  async getStrategies(): Promise<Strategy[]> {
    return await db.select().from(strategies).orderBy(desc(strategies.createdAt));
  }

  async getStrategy(id: number): Promise<Strategy | undefined> {
    const [strategy] = await db.select().from(strategies).where(eq(strategies.id, id));
    return strategy;
  }

  async createStrategy(strategy: InsertStrategy): Promise<Strategy> {
    const [newStrategy] = await db.insert(strategies).values(strategy).returning();
    return newStrategy;
  }

  async updateStrategy(id: number, updates: Partial<InsertStrategy>): Promise<Strategy> {
    const [updated] = await db
      .update(strategies)
      .set(updates)
      .where(eq(strategies.id, id))
      .returning();
    return updated;
  }

  async deleteStrategy(id: number): Promise<void> {
    await db.delete(strategies).where(eq(strategies.id, id));
  }

  // Risk Settings
  async getRiskSettings(): Promise<RiskSettings | undefined> {
    // We assume there's only one row for settings, or we take the latest
    const [settings] = await db.select().from(riskSettings).limit(1);
    return settings;
  }

  async updateRiskSettings(settings: InsertRiskSettings): Promise<RiskSettings> {
    const existing = await this.getRiskSettings();
    
    if (existing) {
      const [updated] = await db
        .update(riskSettings)
        .set(settings)
        .where(eq(riskSettings.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(riskSettings).values(settings).returning();
      return created;
    }
  }

  // Logs
  async getLogs(): Promise<TradeLog[]> {
    return await db.select().from(tradeLogs).orderBy(desc(tradeLogs.timestamp));
  }

  async createLog(log: InsertTradeLog): Promise<TradeLog> {
    const [newLog] = await db.insert(tradeLogs).values(log).returning();
    return newLog;
  }

  async clearLogs(): Promise<void> {
    await db.delete(tradeLogs);
  }
}

export const storage = new DatabaseStorage();
