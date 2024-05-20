import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus } from '@nestjs/common';
import { EmailService } from './email.service';

describe('EmailService', () => {
  let service: EmailService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(), // Mock the sendMail function
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should send an email successfully', async () => {
      const options = {
        email: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test Email</p>',
      };

      const mockSendMail = mailerService.sendMail as jest.Mock;
      mockSendMail.mockResolvedValue('Email Sent');

      const result = await service.sendEmail(options);

      expect(result).toBe('Email Sent');
      expect(mockSendMail).toHaveBeenCalledWith({
        to: options.email,
        subject: options.subject,
        html: options.html,
      });
    });

    it('should throw an HttpException if sendMail fails', async () => {
      const options = {
        email: 'test@example.com',
        subject: 'Test Subject',
        html: '<p>Test Email</p>',
      };

      const mockSendMail = mailerService.sendMail as jest.Mock;
      mockSendMail.mockRejectedValue(new Error('Send Mail Failed'));

      await expect(service.sendEmail(options)).rejects.toThrow(
        new HttpException('Error', HttpStatus.INTERNAL_SERVER_ERROR),
      );
    });
  });
});
