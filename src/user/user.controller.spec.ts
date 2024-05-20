import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const mockUserService = {
  create: jest.fn(),
  find: jest.fn(),
  fetchAvatar: jest.fn(),
  deleteAvatar: jest.fn(),
};

const userDto = {
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
};
const mockUser = { id: '1', ...userDto };

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createUser', () => {
    it('should call userService.createUser and return created user', async () => {
      mockUserService.create.mockResolvedValue(mockUser);

      const result = await controller.createUser(userDto);

      expect(mockUserService.create).toHaveBeenCalledWith(userDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUser', () => {
    it('should call userService.getUser and return user', async () => {
      const userId = 1;
      mockUserService.find.mockResolvedValue(mockUser);

      const result = await controller.getUser(userId);

      expect(mockUserService.find).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserAvatar', () => {
    it('should call userService.fetchAvatar and return avatar', async () => {
      const userId = 1;
      const avatar = 'avatar_url';
      mockUserService.fetchAvatar.mockResolvedValue(avatar);

      const result = await controller.getUserAvatar(userId);

      expect(mockUserService.fetchAvatar).toHaveBeenCalledWith(userId);
      expect(result).toEqual(avatar);
    });
  });

  describe('deleteUserAvatar', () => {
    it('should call userService.deleteAvatar and return success message', async () => {
      const userId = 1;
      const successMessage = 'Avatar successfully deleted';
      mockUserService.deleteAvatar.mockResolvedValue(true);

      const result = await controller.deleteUserAvatar(userId);

      expect(mockUserService.deleteAvatar).toHaveBeenCalledWith(userId);
      expect(result).toEqual(successMessage);
    });

    it('should throw HttpException if deleteAvatar returns false', async () => {
      const userId = 1;
      mockUserService.deleteAvatar.mockResolvedValue(false);

      await expect(controller.deleteUserAvatar(userId)).rejects.toThrow(
        HttpException,
      );
    });
  });
});
