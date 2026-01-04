import { z } from 'zod';
import { 
  insertStrategySchema, 
  insertRiskSettingsSchema, 
  insertTradeLogSchema,
  strategies,
  riskSettings,
  tradeLogs
} from './schema';

// === SHARED ERROR SCHEMAS ===
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// === API CONTRACT ===
export const api = {
  strategies: {
    list: {
      method: 'GET' as const,
      path: '/api/strategies',
      responses: {
        200: z.array(z.custom<typeof strategies.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/strategies',
      input: insertStrategySchema,
      responses: {
        201: z.custom<typeof strategies.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/strategies/:id',
      input: insertStrategySchema.partial(),
      responses: {
        200: z.custom<typeof strategies.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/strategies/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    toggle: {
      method: 'PATCH' as const,
      path: '/api/strategies/:id/toggle',
      responses: {
        200: z.custom<typeof strategies.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  riskSettings: {
    get: {
      method: 'GET' as const,
      path: '/api/risk-settings',
      responses: {
        200: z.custom<typeof riskSettings.$inferSelect>(),
        404: errorSchemas.notFound, // Though we should always return default if empty
      },
    },
    update: {
      method: 'POST' as const,
      path: '/api/risk-settings',
      input: insertRiskSettingsSchema,
      responses: {
        200: z.custom<typeof riskSettings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  logs: {
    list: {
      method: 'GET' as const,
      path: '/api/logs',
      responses: {
        200: z.array(z.custom<typeof tradeLogs.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/logs',
      input: insertTradeLogSchema,
      responses: {
        201: z.custom<typeof tradeLogs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    clear: {
      method: 'DELETE' as const,
      path: '/api/logs',
      responses: {
        204: z.void(),
      },
    },
  },
  bot: {
    download: {
      method: 'GET' as const,
      path: '/api/download-bot',
      responses: {
        200: z.any(), // File download
      },
    },
  },
};

// === HELPER ===
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
