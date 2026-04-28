import { Response, Request, NextFunction } from "express";

export const transferMoney = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).userId;
    if (!userId) {
      res.status(404).send({ message: "somthing went wrong" });
    }
    const { reciverEmail, amount } = req.params;
    // bl function and send data 
    //validate recived data
  } catch (error) {
    next(error);
  }
};
