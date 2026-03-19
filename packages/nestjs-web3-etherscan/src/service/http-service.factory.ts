import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { EtherscanHttpService } from './etherscan-http.service';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class HttpServiceFactory {
  private readonly logger = new Logger(HttpServiceFactory.name);

  createHttpService(apiUrl: string, apiKey: string): HttpService {
    let error = false;
    if (apiUrl === '') {
      this.logger.error(`Vous devez spécifier l'url de l'api Etherscan.`);
      error = true;
    }
    if (apiKey === '') {
      this.logger.error(`Vous devez spécifier la clef de l'api Etherscan.`);
      error = true;
    }
    if (error) {
      throw new Error('Invalid Etherscan configuration');
    }

    const nestHttpService = new HttpService(
      axios.create({
        baseURL: apiUrl,
        timeout: 45 * 1000,
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    const service = new EtherscanHttpService(nestHttpService.axiosRef, apiKey);

    return service;
  }
}
