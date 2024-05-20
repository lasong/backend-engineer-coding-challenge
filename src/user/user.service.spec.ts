import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as fsExtra from 'fs-extra';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';
import { HttpClientService } from '../httpClient/httpClient.service';
import { ProducerService } from '../rabbitmq/producer.service';
import { EmailService } from '../email/email.service';
import { CreateUserDto } from './dto/create-user.dto';

const mockUserModel = () => ({
  create: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findOne: jest.fn(),
  deleteOne: jest.fn(),
});

describe('UserService', () => {
  let service: UserService;
  let userModel: Model<User>;
  let httpClientService: HttpClientService;
  let producerService: ProducerService;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getModelToken(User.name), useValue: mockUserModel() },
        {
          provide: HttpClientService,
          useValue: { get: jest.fn(), getFile: jest.fn() },
        },
        { provide: ProducerService, useValue: { sendToQueue: jest.fn() } },
        { provide: EmailService, useValue: { sendEmail: jest.fn() } },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
    httpClientService = module.get<HttpClientService>(HttpClientService);
    producerService = module.get<ProducerService>(ProducerService);
    emailService = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user, send a message to RabbitMQ and send an email', async () => {
      const createUserDto: CreateUserDto = {
        first_name: 'John',
        last_name: 'John Doe',
        email: 'john.doe@example.com',
      };
      const createdUser = { ...createUserDto, id: 1 };

      jest.spyOn(userModel, 'create').mockResolvedValue(createdUser as any);

      const emailData = {
        email: createdUser.email,
        subject: 'Welcome to the Challenge',
        html: `<p>Hello ${createdUser.first_name}</p>`,
      };

      const result = await service.create(createUserDto);

      expect(result).toEqual(createdUser);
      expect(userModel.create).toHaveBeenCalledWith(createUserDto);
      expect(producerService.sendToQueue).toHaveBeenCalledWith(
        'New user Created!',
      );
      expect(emailService.sendEmail).toHaveBeenCalledWith(emailData);
    });
  });

  describe('find', () => {
    it('should find a user by ID', async () => {
      const userId = 1;
      const user = {
        id: userId,
        name: 'John Doe',
        email: 'john.doe@example.com',
      };
      jest.spyOn(httpClientService, 'get').mockResolvedValue({ data: user });

      const result = await service.find(userId);

      expect(result).toEqual(user);
      expect(httpClientService.get).toHaveBeenCalledWith(
        `${process.env.REQRES_URL}/api/users/${userId}`,
      );
    });
  });

  describe('fetchAvatar', () => {
    it('should return the avatar if user already has one', async () => {
      const userId = 1;
      const user = { id: userId, avatar: 'avatar.png' };
      const fileContent = 'file content';

      jest.spyOn(userModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(user),
      } as any);
      jest
        .spyOn(fsExtra, 'readFileSync')
        .mockReturnValue(Buffer.from(fileContent));

      const result = await service.fetchAvatar(userId);

      expect(result).toBe(Buffer.from(fileContent).toString('base64'));
      expect(userModel.findOne).toHaveBeenCalledWith({ id: userId });
    });

    it('should fetch the avatar if user does not have one', async () => {
      const userId = 1;
      const fileContent = 'file content';
      const avatarUrl = 'http://example.com/avatar.png';
      const fetchedUser = { id: userId, avatar: avatarUrl };

      jest.spyOn(userModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);
      jest
        .spyOn(httpClientService, 'get')
        .mockResolvedValue({ data: fetchedUser });
      jest
        .spyOn(httpClientService, 'getFile')
        .mockResolvedValue(Buffer.from(fileContent));
      jest.spyOn(service, 'generateHash').mockReturnValue('hashed_avatar');
      jest.spyOn(fsExtra, 'outputFileSync').mockImplementation(() => {});

      const result = await service.fetchAvatar(userId);

      expect(result).toBe(Buffer.from(fileContent).toString('base64'));
      expect(userModel.findOne).toHaveBeenCalledWith({ id: userId });
      expect(httpClientService.getFile).toHaveBeenCalledWith(avatarUrl);
      expect(userModel.create).toHaveBeenCalledWith({
        id: userId,
        avatar: 'hashed_avatar',
      });
    });
  });

  describe('deleteAvatar', () => {
    it('should delete the avatar if user has one', async () => {
      const userId = 1;
      const user = { id: userId, avatar: 'avatar.png' };
      jest.spyOn(userModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(user),
      } as any);
      jest.spyOn(userModel, 'deleteOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(user),
      } as any);
      jest.spyOn(fsExtra, 'unlinkSync').mockImplementation(() => {});

      const result = await service.deleteAvatar(userId);

      expect(result).toBe(user.avatar);
      expect(userModel.findOne).toHaveBeenCalledWith({ id: userId });
      expect(fsExtra.unlinkSync).toHaveBeenCalledWith(
        `./avatars/${user.avatar}`,
      );
      expect(userModel.deleteOne).toHaveBeenCalledWith({ id: userId });
    });

    it('should return null if user does not have an avatar', async () => {
      const userId = 1;
      jest.spyOn(userModel, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);
      jest.spyOn(fsExtra, 'unlinkSync').mockImplementation(() => {});

      const result = await service.deleteAvatar(userId);

      expect(result).toBeUndefined();
      expect(userModel.findOne).toHaveBeenCalledWith({ id: userId });
      expect(userModel.deleteOne).not.toHaveBeenCalled();
    });
  });
});
