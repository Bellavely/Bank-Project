import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

const getTransporter = async () => {
  if (transporter) return transporter;
  console.log(
    `✅ Email transporter created ${process.env.EMAIL_FROM} ${process.env.EMAIL_PASSWORD}`,
  );

  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_FROM || "",
      pass: process.env.EMAIL_PASSWORD || "",
    },
  });
  return transporter;
};

export const sendMail = async (recipientEmail: string, otp: number) => {
  try {
    const transport = await getTransporter();

    const info = await transport.sendMail({
      from: `"Cashio Bank" < ${process.env.EMAIL_FROM}> `,
      to: recipientEmail,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otp}`,
      html: `<h3>Welcome to Cashio Bank!</h3><p>Your OTP code for registration is: <strong>${otp}</strong></p>`,
    });

    console.log("✅ Email sent successfully");
    console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

export const generateOTP = () => Math.floor(100000 + Math.random() * 900000);
