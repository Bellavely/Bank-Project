import { z } from "zod";
export const validatelimit = z.coerce.number();
export const validatePage = z.coerce.number();
export const validateTransfer = z.object({
  receiverEmail: z.email("האימייל לא תקין"),
  amount: z.number("סכום חובה "),
  message: z.string("הודעה לא קיימת"),
});
export const validateTransactionId = z.string();
