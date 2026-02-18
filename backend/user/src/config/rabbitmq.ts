import "dotenv/config";
import amqp from "amqplib";

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect({
      protocol: "amqp",
      hostname: process.env.RABBITMQ_HOST,
      port: 5672,
      username: process.env.RABBITMQ_USERNAME,
      password: process.env.RABBITMQ_PASSWORD,
    });
    channel = await connection.createChannel();
    console.log("✅ connected to Rabbitmq");
  } catch (error) {
    console.log("Failed to connect rabbitmq: ", error);
  }
};

export const publishToQueue = async (queueName: string, message: any) => {
  if (!channel) {
    console.log("Rabbitmq channel is not initialized");
    return;
  }
  await channel.assertQueue(queueName, {
    durable: true, // makes the queue persistent so messages are not lost after a broker crash/restart
  });

  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
    persistent: true, // store message on disk so it is not lost if RabbitMQ restarts
  });
};
