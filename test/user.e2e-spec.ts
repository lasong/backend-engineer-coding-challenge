import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import mongoose from 'mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import { database, imports } from './constants';
import { CreateUserDto } from '../src/user/dto/create-user.dto';
import { EmailService } from '../src/email/email.service';

beforeAll(async () => {
  await mongoose.connect(database);
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
});

jest.mock('fs-extra');

jest.mock('amqp-connection-manager', () => {
  const mockConnect = jest.fn();
  const mockCreateChannel = jest.fn();
  const mockAssertQueue = jest.fn().mockResolvedValue({});

  return {
    connect: mockConnect.mockImplementation(() => ({
      createChannel: mockCreateChannel.mockImplementation(() => ({
        assertQueue: mockAssertQueue,
        sendToQueue: jest.fn(),
      })),
    })),
  };
});

describe('User (e2e)', () => {
  let app: INestApplication;

  const createUserDto: CreateUserDto = {
    first_name: 'John',
    last_name: 'Wick',
    email: 'john_wick@gmail.com',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports,
      providers: [
        EmailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/users (POST) 201', () => {
    return request(app.getHttpServer())
      .post('/api/users')
      .set('Accept', 'application/json')
      .send(createUserDto)
      .expect(({ body }) => {
        expect(body.first_name).toEqual(createUserDto.first_name);
        expect(body.last_name).toEqual(createUserDto.last_name);
        expect(body.email).toEqual(createUserDto.email);
      })
      .expect(HttpStatus.CREATED);
  });

  describe('/api/user/{userId} (GET)', () => {
    it('returns 200 status code and user data', () => {
      return request(app.getHttpServer())
        .get('/api/user/1')
        .set('Accept', 'application/json')
        .expect(({ body }) => {
          expect(body.id).not.toEqual(null);
          expect(body.first_name).not.toEqual(null);
          expect(body.last_name).not.toEqual(null);
          expect(body.avatar).not.toEqual(null);
        })
        .expect(HttpStatus.OK);
    });

    it('return 404 status code if no data is found', () => {
      return request(app.getHttpServer())
        .get('/api/user/1000')
        .set('Accept', 'application/json')
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('/api/user/{userId}/avatar (GET)', () => {
    it('returns 200 status code and base64 file content', () => {
      return request(app.getHttpServer())
        .get('/api/user/2/avatar')
        .set('Accept', 'application/json')
        .expect(({ body }) => {
          expect(body).not.toEqual(null);
        })
        .expect(HttpStatus.OK);
    });

    it('returns 404 status code if user is not found', () => {
      return request(app.getHttpServer())
        .get('/api/user/200/avatar')
        .set('Accept', 'application/json')
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('/api/user/{userId}/avatar (DELETE)', () => {
    it('returns 200 status code if file is deleted from database', () => {
      return request(app.getHttpServer())
        .delete('/api/user/2/avatar')
        .set('Accept', 'application/json')
        .expect(HttpStatus.OK);
    });

    it('returns 404 status code if avatar is not found in database', () => {
      // File has been deletee already in previous test, so this test should fail
      return request(app.getHttpServer())
        .delete('/api/user/2/avatar')
        .set('Accept', 'application/json')
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
