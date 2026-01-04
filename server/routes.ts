import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // === Strategies ===
  app.get(api.strategies.list.path, async (req, res) => {
    const items = await storage.getStrategies();
    res.json(items);
  });

  app.post(api.strategies.create.path, async (req, res) => {
    try {
      const input = api.strategies.create.input.parse(req.body);
      const item = await storage.createStrategy(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.strategies.update.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.strategies.update.input.parse(req.body);
      const item = await storage.updateStrategy(id, input);
      res.json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      // If not found, updateStrategy might throw or return undefined based on implementation. 
      // Storage implementation above returns row, if empty it might throw.
      // For simplicity in this demo, we assume success or 500.
      throw err;
    }
  });

  app.delete(api.strategies.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    await storage.deleteStrategy(id);
    res.status(204).send();
  });

  app.patch(api.strategies.toggle.path, async (req, res) => {
    const id = Number(req.params.id);
    const strategy = await storage.getStrategy(id);
    if (!strategy) return res.status(404).json({ message: "Not found" });
    
    const updated = await storage.updateStrategy(id, { active: !strategy.active });
    res.json(updated);
  });

  // === Risk Settings ===
  app.get(api.riskSettings.get.path, async (req, res) => {
    const settings = await storage.getRiskSettings();
    if (!settings) {
      // Return defaults if not set
      return res.json({
        maxDailyLoss: 100,
        tradeSize: 10,
        dailyStopLoss: 50,
        takeProfit: 200,
        martingaleMultiplier: "1.0",
        active: true
      });
    }
    res.json(settings);
  });

  app.post(api.riskSettings.update.path, async (req, res) => {
    try {
      const input = api.riskSettings.update.input.parse(req.body);
      const updated = await storage.updateRiskSettings(input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // === Logs ===
  app.get(api.logs.list.path, async (req, res) => {
    const logs = await storage.getLogs();
    res.json(logs);
  });

  app.post(api.logs.create.path, async (req, res) => {
    try {
      const input = api.logs.create.input.parse(req.body);
      const log = await storage.createLog(input);
      res.status(201).json(log);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.logs.clear.path, async (req, res) => {
    await storage.clearLogs();
    res.status(204).send();
  });

  // === Bot Script Generation ===
  app.get(api.bot.download.path, async (req, res) => {
    const strategies = await storage.getStrategies();
    const risk = await storage.getRiskSettings();
    
    const activeStrategies = strategies.filter(s => s.active);
    
    // Simple template injection
    // In a real app, this would be a more robust template system or zip file
    const scriptContent = generatePythonScript(activeStrategies, risk);
    
    res.setHeader('Content-Type', 'text/x-python');
    res.setHeader('Content-Disposition', 'attachment; filename="bot.py"');
    res.send(scriptContent);
  });

  // === Seeding ===
  const existing = await storage.getStrategies();
  if (existing.length === 0) {
    await storage.createStrategy({
      name: "RSI Reversal",
      description: "Buys when RSI < 30, Sells when RSI > 70",
      config: { indicator: "RSI", period: 14, overbought: 70, oversold: 30 },
      active: true
    });
    await storage.createStrategy({
      name: "EMA Crossover",
      description: "Buys when fast EMA crosses above slow EMA",
      config: { indicator: "EMA", fast: 9, slow: 21 },
      active: false
    });
  }

  return httpServer;
}

function generatePythonScript(strategies: any[], risk: any) {
  // This is a simplified template. 
  // In production, this would use a proper templating engine.
  const riskConfig = risk || {
    maxDailyLoss: 100,
    tradeSize: 10,
    dailyStopLoss: 50,
    takeProfit: 200,
    martingaleMultiplier: "1.0"
  };

  return `
import time
import random
import requests
import json
import logging
from datetime import datetime

# === CONFIGURATION ===
API_URL = "http://localhost:5000" # Change if deployed remotely
RISK_CONFIG = ${JSON.stringify(riskConfig, null, 2)}
STRATEGIES = ${JSON.stringify(strategies, null, 2)}

# === SETUP LOGGING ===
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class TradingBot:
    def __init__(self):
        self.daily_pnl = 0
        self.consecutive_losses = 0
        self.current_trade_size = RISK_CONFIG.get('tradeSize', 10)
        
    def check_risk_limits(self):
        if self.daily_pnl <= -RISK_CONFIG.get('maxDailyLoss', 100):
            logging.warning("Max daily loss reached. Stopping trading.")
            return False
        return True

    def execute_strategy(self, strategy):
        logging.info(f"Checking strategy: {strategy['name']}")
        
        # --- PLACEHOLDER FOR STRATEGY LOGIC ---
        # Here you would implement the actual indicator checks
        # using libraries like 'pandas_ta' or 'talib'
        # For this template, we simulate a signal
        
        signal = random.choice(['BUY', 'SELL', 'WAIT', 'WAIT', 'WAIT'])
        
        if signal != 'WAIT':
            self.place_trade(signal, strategy)

    def place_trade(self, action, strategy):
        if not self.check_risk_limits():
            return

        amount = self.current_trade_size
        symbol = "EURUSD" # Placeholder
        
        logging.info(f"Placing {action} trade on {symbol} for \${amount}")
        
        # --- PLACEHOLDER FOR UI AUTOMATION ---
        # import pyautogui
        # pyautogui.click(x=100, y=200) 
        # ...
        
        # Simulate result
        is_win = random.choice([True, False])
        result = "WIN" if is_win else "LOSS"
        pnl = amount * 0.85 if is_win else -amount
        
        self.daily_pnl += pnl
        
        # Martingale Logic
        multiplier = float(RISK_CONFIG.get('martingaleMultiplier', 1.0))
        if not is_win and multiplier > 1.0:
            self.current_trade_size *= multiplier
        else:
            self.current_trade_size = RISK_CONFIG.get('tradeSize', 10)

        self.log_trade(strategy['id'], symbol, action, amount, result)

    def log_trade(self, strategy_id, symbol, action, amount, result):
        payload = {
            "strategyId": strategy_id,
            "symbol": symbol,
            "action": action,
            "amount": int(amount),
            "result": result,
            "price": "1.1000" # Placeholder
        }
        try:
            requests.post(f"{API_URL}/api/logs", json=payload)
            logging.info(f"Trade logged: {result}")
        except Exception as e:
            logging.error(f"Failed to report trade: {e}")

    def run(self):
        logging.info("Bot started...")
        logging.info(f"Active Strategies: {len(STRATEGIES)}")
        
        while True:
            if not self.check_risk_limits():
                break
                
            for strategy in STRATEGIES:
                self.execute_strategy(strategy)
                
            time.sleep(5) # Interval

if __name__ == "__main__":
    bot = TradingBot()
    bot.run()
`;
}
