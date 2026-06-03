import { StatusCodes } from "http-status-codes/build/cjs/status-codes";

export class NotFoundError extends Error {
  public readonly statusCode = StatusCodes.NOT_FOUND;
  public readonly resource: string;

  constructor(resource: string, identifier: string) {
    super(`${resource} with ${identifier} not found`);
    this.resource = resource;
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly message: string;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
