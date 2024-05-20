import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({
    type: String,
    default: () => new Types.ObjectId().toString(),
  })
  _id: string;

  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  avatar: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
