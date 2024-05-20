import {
  Controller,
  Param,
  Post,
  Get,
  Body,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('api')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('users')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('user/:userId')
  async getUser(@Param('userId') userId: number) {
    return this.userService.find(userId);
  }

  @Get('user/:userId/avatar')
  async getUserAvatar(@Param('userId') userId: number) {
    return this.userService.fetchAvatar(userId);
  }

  @Delete('user/:userId/avatar')
  async deleteUserAvatar(@Param('userId') userId: number) {
    const deleted_avatar = await this.userService.deleteAvatar(userId);
    if (!deleted_avatar) {
      throw new HttpException(
        'Avatar counld not be found',
        HttpStatus.NOT_FOUND,
      );
    }

    return 'Avatar successfully deleted';
  }
}
