import { z } from "zod";
export const validatelimit = z.coerce.number();
export const validatePage = z.coerce.number();
export const validateTransfer = z.object({
  receiverEmail: z.email(),
  amount: z.number(),
  message: z.string(),
});
