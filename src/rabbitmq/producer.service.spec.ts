import { Test, TestingModule } from '@nestjs/testing';
import { ProducerService } from './producer.service';

jest.mock('amqp-connection-manager', () => {
  const mockConnect = jest.fn();
  const mockCreateChannel = jest.fn();
  const mockAssertQueue = jest.fn().mockResolvedValue({});

  return {
    connect: mockConnect.mockImplementation(() => ({
      createChannel: mockCreateChannel.mockImplementation(() => ({
        assertQueue: mockAssertQueue,
        sendToQueue: jest.fn()
      }))
    }))
  };
});

describe('ProducerService', () => {
  let service: ProducerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProducerService],
    }).compile();

    service = module.get<ProducerService>(ProducerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendToQueue', () => {
    it('should send a message to the queue', async () => {
      const message = { key: 'value' };

      await expect(service.sendToQueue(message)).resolves.toBeUndefined();

      // Assert that the mock function was called with the correct parameters
      expect(service['channelWrapper'].sendToQueue).toHaveBeenCalledWith(
        service['queue'],
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );
    });
  });
});
