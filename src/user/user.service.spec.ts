import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';

const createUserDto = {
  name: "John Doe",
  email: 'test@example.com'
}

const mockUser = {
  _id: '664b107b127f7rd8957d4352',
  email: 'test@example.com',
  name: 'John Doe',
  avatar: 'avatar_url',
};

describe('UserService', () => {
  let service: UserService;
  let mockUserModel: Model<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findById: jest.fn(),
            create: jest.fn(),
          }
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    mockUserModel = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // describe('create', () => {
  //   it('should create a new user', async () => {
  //     const user = new User()
  //     user.name = mockUser.name
  //     user.email = mockUser.email
  //     user._id = mockUser._id
  //     jest.spyOn(mockUserModel, 'create').mockResolvedValue([user]);

  //     const result = await service.create(createUserDto);

  //     expect(result).toEqual(mockUser);
  //     expect(mockUserModel.create).toHaveBeenCalledWith(createUserDto);
  //   });
  // });

  describe('find', () => {
    it('should find a user by ID', async () => {
      const userId = 'some-user-id';

      jest.spyOn(mockUserModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      } as any);

      const result = await service.find(userId);

      expect(result).toEqual(mockUser);
      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 'invalid-user-id';

      jest.spyOn(mockUserModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.find(userId)).rejects.toThrow(NotFoundException);
      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
    });
  });
});
