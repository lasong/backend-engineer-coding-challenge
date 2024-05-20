import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';
import { HttpClientService } from '../httpClient/httpClient.service';
import * as fsExtra from 'fs-extra';
import * as crypto from 'crypto';

jest.mock('fs-extra');
jest.mock('crypto', () => ({
  createHash: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue({
      digest: jest.fn().mockReturnValue('hashedavatar')
    })
  })
}));

describe('UserService', () => {
  let service: UserService;
  let mockUserModel: Model<User>;
  let httpClientService: HttpClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            findOneAndUpdate: jest.fn(),
            deleteOne: jest.fn()
          },
        },
        {
          provide: HttpClientService,
          useValue: {
            get: jest.fn(),
            getFile: jest.fn()
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    mockUserModel = module.get<Model<User>>(getModelToken(User.name));
    httpClientService = module.get<HttpClientService>(HttpClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // describe('create', () => {
  //   it('should create a new user', async () => {
  //     const createUserDto = { first_name: 'John', last_name: 'Doe', email: 'john@example.com' };
  //     const user = { ...createUserDto, id: 1 } as User;

  //     jest.spyOn(mockUserModel, 'create').mockResolvedValue(user);

  //     const result = await service.create(createUserDto);

  //     expect(result).toEqual(user);
  //     expect(mockUserModel.create).toHaveBeenCalledWith(createUserDto);
  //   });
  // });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = 1;
      const updateData = { first_name: 'Jane', last_name: 'Doe' };
      const updatedUser = { ...updateData, id: userId } as User;

      jest.spyOn(mockUserModel, 'findOneAndUpdate').mockResolvedValue({
        exec: jest.fn().mockResolvedValueOnce(updatedUser),
      });

      const result = await service.update(userId, updateData);

      expect(result).toEqual(updatedUser);
      expect(mockUserModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id: userId },
        updateData,
        { new: true }
      );
    });
  });

  describe('find', () => {
    it('should find a user by ID', async () => {
      const userId = 1;
      const user = {
        id: userId, first_name: 'John', last_name: 'Doe', email: 'john@example.com'
      } as User;

      jest.spyOn(httpClientService, 'get').mockResolvedValue({ data: user });

      const result = await service.find(userId);

      expect(result).toEqual(user);
      expect(httpClientService.get)
        .toHaveBeenCalledWith(`${process.env.REQRES_URL}/api/users/${userId}`);
    });
  });

  describe('fetchAvatar', () => {
    it('should fetch and return avatar from cache if exists', async () => {
      const userId = 1;
      const avatar = 'avatar';
      const user = { id: userId, avatar } as User;
      const fileContent = 'file-content';

      jest.spyOn(mockUserModel, 'findOne').mockResolvedValue({
        exec: jest.fn().mockResolvedValueOnce(user),
      });
      jest.spyOn(fsExtra, 'readFileSync').mockReturnValue(fileContent);

      const result = await service.fetchAvatar(userId);

      expect(result).toEqual(Buffer.from(fileContent).toString('base64'));
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ id: userId });
      expect(fsExtra.readFileSync).toHaveBeenCalledWith(`./avatars/${avatar}`);
    });

    it('should fetch and cache avatar if not in cache', async () => {
      const userId = 1;
      const user = { id: userId } as User;
      const fileContent = 'file-content';
      const avatarUrl = 'http://example.com/avatar';

      jest.spyOn(mockUserModel, 'findOne').mockResolvedValue({
        exec: jest.fn().mockResolvedValueOnce(null)
      });
      jest.spyOn(service, 'find').mockResolvedValue({ ...user, avatar: avatarUrl } as User);
      jest.spyOn(httpClientService, 'getFile').mockResolvedValue(Buffer.from('file-content'));
      jest.spyOn(mockUserModel, 'create').mockResolvedValue(null);
      jest.spyOn(fsExtra, 'outputFileSync').mockImplementation();

      const result = await service.fetchAvatar(userId);

      expect(result).toEqual(Buffer.from(fileContent).toString('base64'));
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ id: userId });
      expect(service.find).toHaveBeenCalledWith(userId);
      expect(httpClientService.getFile).toHaveBeenCalledWith(avatarUrl);
      expect(fsExtra.outputFileSync).toHaveBeenCalledWith(`./avatars/hashedavatar`, fileContent);
      expect(mockUserModel.create).toHaveBeenCalledWith({ id: userId, avatar: 'hashedavatar' });
    });
  });

  describe('deleteAvatar', () => {
    it('should delete avatar if exists', async () => {
      const userId = 1;
      const avatar = 'avatar';
      const user = { id: userId, avatar } as User;

      jest.spyOn(mockUserModel, 'findOne').mockResolvedValue(user);
      jest.spyOn(fsExtra, 'unlinkSync').mockImplementation();
      jest.spyOn(mockUserModel, 'deleteOne').mockResolvedValue(null);

      const result = await service.deleteAvatar(userId);

      expect(result).toEqual(avatar);
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ id: userId });
      expect(fsExtra.unlinkSync).toHaveBeenCalledWith(`./avatars/${avatar}`);
      expect(mockUserModel.deleteOne).toHaveBeenCalledWith({ id: userId });
    });

    it('should return null if no avatar exists', async () => {
      const userId = 1;

      jest.spyOn(mockUserModel, 'findOne').mockResolvedValue({
        exec: jest.fn().mockResolvedValueOnce(null)
      });

      const result = await service.deleteAvatar(userId);

      expect(result).toBeUndefined();
      expect(mockUserModel.findOne).toHaveBeenCalledWith({ id: userId });
    });
  });
});
