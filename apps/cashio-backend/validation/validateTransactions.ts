import z from "zod";
export const validatelimit = z.number();
export const validatePage = z.number();
export const validateTransfer = z.object({
  reciverEmail: z.email(),
  amount: z.number(),
});
