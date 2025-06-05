import { z } from 'zod';

export const PromptSchema = z.object({
  base: z.string().default(''),
  examples: z.string().default(''),
  rules: z.string().default(''),
  decision_logic: z.string().default(''),
  response_format: z.string().default(''),
  other_instructions: z.string().default('')
});

export const AgentSchema = z.object({
  agentId: z.string().min(1, 'ID del agente es requerido'),
  agentName: z.string().min(1, 'Nombre del agente es requerido'),
  description: z.string().default(''),
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
export type User = z.infer<typeof UserSchema>; 