import z, { email } from "zod";

export const validateLogin = z.object({
  email: z.email(),
  password: z.string(),
});

export const validateRegister = z.object({
  email: z.email(),
  fullname: z.string().min(3, "שם מלא אמור להיות ארוך יותר"),
  phone: z
    .string()
    .max(7, "אורך המספר לא תקין")
    .regex(/^\d+$/, "חייב להכיל ספרות"),
  password: z.string().min(5, "סיסמה חייבת להיות ארוכה יותר"),
  validatePassword: z.string().min(5, "סיסמה חייבת להיות ארוכה יותר"),
});
