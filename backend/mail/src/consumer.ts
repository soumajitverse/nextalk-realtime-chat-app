import "dotenv/config";
import amqp from "amqplib";
import nodemailer from "nodemailer";

export const startSendOTPConsumer = async () => {
  try {
    const connection = await amqp.connect({
      protocol: "amqp",
      hostname: process.env.RABBITMQ_HOST,
      port: 5672,
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD,
    });
    const channel = await connection.createChannel();

    const queueName = "send-otp";
    await channel.assertQueue(queueName, {
      durable: true, // makes the queue persistent so messages are not lost after a broker crash/restart
    });
    console.log("✅ Mail Service consumer started, listening for otp emails");

    channel.consume(queueName, async (msg) => {
      if (msg) {
        try {
          const { to, subject, body } = JSON.parse(msg.content.toString());
          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.email",
            port: 465,
            secure: true, // Use true for port 465, false for port 587
            auth: {
              user: process.env.USER,
              pass: process.env.PASSWORD,
            },
          });

          await transporter.sendMail({
            from: "NEXTALK-ChatApp",
            to,
            subject,
            text: body, // Plain-text version of the message
            // html: "<b>Hello world?</b>", // HTML version of the message
          });

          console.log(`OTP mail sent to ${to}`);
          channel.ack(msg);
        } catch (error) {
          console.log("Failed to send OTP:", error);
        }
      }
    });
  } catch (error) {
    console.log("Failed to start rabbitmq consumer:", error);
  }
};
