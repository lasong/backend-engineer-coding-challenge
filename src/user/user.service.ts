import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as crypto from 'crypto';
import { outputFileSync, readFileSync, unlinkSync } from 'fs-extra';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { HttpClientService } from '../httpClient/httpClient.service';
import { ProducerService } from '../rabbitmq/producer.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly httpClientService: HttpClientService,
    private readonly producerService: ProducerService
    ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = await this.userModel.create(createUserDto);
    this.producerService.sendToQueue('New user Created!')
    // Email sending comes here
    return createdUser;
  }

  async update(userId: number, attributes: Partial<User>): Promise<User> {
    return this.userModel.findOneAndUpdate({ id: userId }, attributes, { new: true }).exec();
  }

  async find(userId: number): Promise<User> {
    const data: any = await this.httpClientService.get(`${process.env.REQRES_URL}/api/users/${userId}`);
    const user = data.data as User
    return user
  }

  async fetchAvatar(userId: number): Promise<string> {
    const user = await this.userModel.findOne({ id: userId }).exec();
    if (user?.avatar) {
      const file = readFileSync(`./avatars/${user.avatar}`);
      return file.toString('base64');
    } else {
      const data = await this.find(userId);
      const avatarUrl = data.avatar;
      const file = await this.httpClientService.getFile(avatarUrl);
      const avatarHash = crypto.createHash('md5').update(file).digest('hex');

      outputFileSync(`./avatars/${avatarHash}`, file);
      await this.userModel.create({ id: userId, avatar: avatarHash });

      return file.toString('base64');
    }
  }

  async deleteAvatar(userId: number): Promise<string> {
    const user = await this.userModel.findOne({ id: userId }).exec();
    if (user?.avatar) {
      unlinkSync(`./avatars/${user.avatar}`);
      await this.userModel.deleteOne({ id: userId }).exec();
    }
    return user?.avatar
  }
}
