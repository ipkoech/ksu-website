import { z } from "zod";

export const createUserSchema = z
  .object({
    email: z.string().email("Enter a valid email address."),
    first_name: z.string().min(1, "First name is required.").max(50, "First name must be 50 characters or fewer."),
    last_name: z.string().min(1, "Last name is required.").max(50, "Last name must be 50 characters or fewer."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Password must include an uppercase letter.")
      .regex(/[0-9]/, "Password must include a number."),
    confirm_password: z.string().min(8, "Confirm the password."),
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
  secret: z.string().max(255).optional().nullable(),
  events: z.array(z.string()).min(1),
  is_active: z.boolean().default(true),
});
