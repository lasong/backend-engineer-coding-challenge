import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from '../src/user/user.module';

export const database = process.env.MONGO_URI_DEV;

export const imports = [
  ConfigModule.forRoot(),
  MongooseModule.forRoot(database),
  UserModule,
];
