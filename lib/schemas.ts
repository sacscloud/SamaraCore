import { z } from 'zod';

export const PromptSchema = z.object({
  base: z.string().default(''),
  objectives: z.array(z.string()).default([]),
  rules: z.array(z.string()).default([]),
  examples: z.string().default(''),
  responseFormat: z.string().default('')
});

export const ConfiguracionSchema = z.object({
  modelo: z.string().default('gpt-4o-mini'),
  temperatura: z.number().min(0, 'La temperatura debe ser mayor o igual a 0').max(1, 'La temperatura debe ser menor o igual a 1').default(0.7)
});

export const AgentSchema = z.object({
  agentId: z.string().min(1, 'ID del agente es requerido'),
  agentName: z.string().min(1, 'Nombre del agente es requerido'),
  description: z.string().default(''),
  categoria: z.string().default('utilidad'),
  configuracion: ConfiguracionSchema.default({ modelo: 'gpt-4o-mini', temperatura: 0.7 }),
  prompt: PromptSchema,
  agents: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([])
});

export const UserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  createdAt: z.date().default(new Date()),
  updatedAt: z.date().default(new Date())
});

export type Agent = z.infer<typeof AgentSchema>;
export type Prompt = z.infer<typeof PromptSchema>;
export type Configuracion = z.infer<typeof ConfiguracionSchema>;
export type User = z.infer<typeof UserSchema>; 