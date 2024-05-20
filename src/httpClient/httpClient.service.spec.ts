import { Test, TestingModule } from '@nestjs/testing';
import { HttpClientService } from './httpClient.service';
import axios from 'axios';
import { HttpException, HttpStatus } from '@nestjs/common';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HttpClientService', () => {
  let service: HttpClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpClientService],
    }).compile();

    service = module.get<HttpClientService>(HttpClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch data from external API', async () => {
    const result = { data: { data: { id: 2 } } };
    mockedAxios.get.mockResolvedValueOnce(result);

    const data = await service.get('https://reqres.in/api/users/2');
    expect(data['data']).toHaveProperty('id', 2);
  });

  it('should throw not found error', async () => {
    const errorResponse = {
      response: {
        status: 404,
        data: { message: 'Not Found' },
      },
    };
    mockedAxios.get.mockRejectedValueOnce(errorResponse);

    try {
      await service.get('https://reqres.in/api/users/999');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.status).toBe(HttpStatus.NOT_FOUND);
      expect(error.message).toBe('Resource not found');
    }
  });

  it('should throw internal server error', async () => {
    const errorResponse = {
      response: {
        status: 500,
        data: { message: 'Internal Server Error' },
      },
    };
    mockedAxios.get.mockRejectedValueOnce(errorResponse);

    try {
      await service.get('https://reqres.in/api/users/1');
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(error.message).toBe('Internal server error');
    }
  });
});
