import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [DatabaseModule, RabbitmqModule, UserModule],
})
export class AppModule {}
