// import Mailjet from "node-mailjet";

// const mailService = Mailjet.apiConnect(
//   "9a9a8bb4c9fbc2d8af5003ad4cb63aa9",
//   "03c81fdfbbea22a8b06e2e0f1c0312c2",
// );

// export const sendMail = (recipientEmail: string, otp: number) => {
//   const request = mailService.post("send", {}).request({
//     messages: [
//       {
//         from: {
//           Email: "cakes75282@kynninc.com",
//           Name: "fake",
//         },
//         To: [
//           {
//             Email: recipientEmail,
//             Name: "Recipient Name",
//           },
//         ],
//         Subject: "Your OTP Code",
//         TextPart: `Your OTP code is ${otp}`,
//       },
//     ],
//   });

//   request
//     .then((result) => {
//       console.log("email sent ", result.body);
//     })
//     .catch((error) => {
//       console.log("Error sending email:", error);
//     });
// };

// export const otp = Math.floor(100000 + Math.random() * 900000);
