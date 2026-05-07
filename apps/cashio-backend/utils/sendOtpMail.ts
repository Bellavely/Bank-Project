import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  const testAccount = await nodemailer.createTestAccount();
  console.log("📧 Ethereal email account created:");
  console.log(`   User: ${testAccount.user}`);
  console.log(`   Pass: ${testAccount.pass}`);

  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log("✅ SMTP transport created");

  return transporter;
};

export const sendMail = async (recipientEmail: string, otp: number) => {
  try {
    const transport = await getTransporter();

    const info = await transport.sendMail({
      from: '"Cashio Bank" <cashio@bank.dev>',
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
