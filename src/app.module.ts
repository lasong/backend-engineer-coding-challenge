import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { UserModule } from './user/user.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [DatabaseModule, RabbitmqModule, UserModule, EmailModule],
})
export class AppModule {}
