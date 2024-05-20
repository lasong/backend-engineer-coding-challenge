import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { HttpClientModule } from 'src/httpClient/httpClient.module';
import { User, UserSchema } from './schemas/user.schema';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    HttpClientModule,
    RabbitmqModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
