import { z } from "zod";

export const createUserSchema = z
  .object({
    email: z.string().email(),
    first_name: z.string().min(1).max(50),
    last_name: z.string().min(1).max(50),
    password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
    confirm_password: z.string().min(8),
    send_welcome_email: z.boolean().default(true),
    role_ids: z.array(z.string()).optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords must match",
  });

export const createRoleSchema = z.object({
  name: z.string().min(2).max(64).regex(/^[a-z][a-z0-9_]*$/),
  display_name: z.string().min(2).max(128),
  description: z.string().max(255).optional(),
  permissions: z.array(z.string()).min(1),
});

export const webhookSchema = z.object({
  name: z.string().min(1).max(255),
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  is_active: z.boolean().default(true),
});
