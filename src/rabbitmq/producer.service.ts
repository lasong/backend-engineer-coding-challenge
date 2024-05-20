import { Injectable } from '@nestjs/common';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { Channel } from 'amqplib';

@Injectable()
export class ProducerService {
  private channelWrapper: ChannelWrapper;
  private queue: string;

  constructor() {
    this.queue = 'user_queue';
    const connection = amqp.connect([process.env.RABBITMQ_URI]);
    this.channelWrapper = connection.createChannel({
      setup: (channel: Channel) => {
        return channel.assertQueue(this.queue, { durable: true });
      },
    });
  }

  async sendToQueue(message: any) {
    await this.channelWrapper.sendToQueue(
      this.queue,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
      },
    );
  }
}
