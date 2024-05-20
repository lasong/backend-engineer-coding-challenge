import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

const mockUserService = {
  create: jest.fn(),
  find: jest.fn()
};

const userDto = { email: 'test@example.com', name: 'John Doe' };
const mockUser = { _id: 'auto-generated-id', ...userDto };

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{ provide: UserService, useValue: mockUserService }]
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
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
      const userId = 'user-id';
      mockUserService.find.mockResolvedValue(mockUser);

      const result = await controller.getUser(userId);

      expect(mockUserService.find).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });
  });
});
