import Mailjet from "node-mailjet";
import dotenv from "dotenv";
dotenv.config();

const mailService = Mailjet.apiConnect(
  process.env.MAILJET_KEY!,
  process.env.MAILJET_SECRET!,
);

export const sendMail = (recipientEmail: string, otp: number) => {
  const request = mailService.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: process.env.MYMAIL!,
          Name: "Cashio Bank",
        },
        To: [
          {
            Email: recipientEmail,
            Name: "User",
          },
        ],
        Subject: "Your OTP Code",
        TextPart: `Your OTP code is ${otp}`,
        HTMLPart: `<h3>Welcome to Cashio Bank!</h3><p>Your OTP code for registration is: <strong>${otp}</strong></p>`,
      },
    ],
  });

  request
    .then((result) => {
      console.log("Email sent successfully:", result.body);
    })
    .catch((error) => {
      console.error("Error sending email:", error);
    });
};

export const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

