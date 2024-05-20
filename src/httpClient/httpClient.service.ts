import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';

@Injectable()
export class HttpClientService {
  async get<T>(url: string): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axios.get(url);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new HttpException('Resource not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getFile(url: string): Promise<Buffer> {
    try {
      const fileResponse = await axios.get(url, {
        responseType: 'arraybuffer',
      });
      return Buffer.from(fileResponse.data, 'binary');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        throw new HttpException('Resource not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
