import { StatusCodes } from "http-status-codes";
import { AppError } from "./notFoundError";

interface SendRegistrationOtpOptions {
  to: string;
  otp: number;
}

export const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

export const sendMail = async ({
  to,
  otp,
}: SendRegistrationOtpOptions): Promise<void> => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.EMAIL_FROM;

  if (!apiKey || !senderEmail) {
    throw new Error("Missing Brevo configuration in environment variables.");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: {
        name: "My App Security",
        email: senderEmail,
      },
      to: [{ email: to }],
      subject: "Verify Your Account - Registration OTP",
      htmlContent: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 500px; margin: auto; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #333;">Welcome to our platform!</h2>
          <p>Thank you for signing up. Please enter the following verification code to activate your account:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; text-align: center; color: #2563eb; padding: 15px; background-color: #f3f4f6; border-radius: 6px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #666;">This security code is valid for 10 minutes. If you did not register for this account, please ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.log(`${JSON.stringify(errorData)}`);
    throw new AppError(StatusCodes.BAD_REQUEST, `${JSON.stringify(errorData)}`);
  }
};
