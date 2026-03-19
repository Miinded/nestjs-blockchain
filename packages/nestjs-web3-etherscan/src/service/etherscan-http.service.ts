import { Injectable, Logger, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AxiosResponse, AxiosError, AxiosRequestConfig, AxiosInstance } from 'axios';
import { HttpService as NestHttpService } from '@nestjs/axios';
import { Observable } from 'rxjs';
import { EtherscanPayload } from '../interfaces/etherscan.interface';

@Injectable()
export class EtherscanHttpService extends NestHttpService {
  private readonly logger = new Logger(EtherscanHttpService.name);

  private apiKey: string;

  constructor(axiosRef: AxiosInstance, apiKey: string) {
    super(axiosRef);
    this.apiKey = apiKey;

    const sleep = (delay: number) => {
      return new Promise((resolve) => {
        setTimeout(resolve, delay);
      });
    };

    this.axiosRef.interceptors.response.use(
      async (response: AxiosResponse) => {
        const { result } = response.data as EtherscanPayload;
        const results = [
          'Max rate limit reached',
          'Max rate limit reached, please use API Key for higher rate limit',
          'Too many invalid api key attempts, please try again later',
        ];
        if (results.includes(result)) {
          await sleep(2 * 1000);
          return this.axiosRef.request(response.config);
        }
        return response;
      },
      async (error: AxiosError) => {
        this.logger.debug('status error => ' + error.response?.status, error);

        if (error.response?.status === 503) {
          let retryAfter = parseInt(error.response.headers['retry-after'] as string);
          if (isNaN(retryAfter)) {
            retryAfter = 1;
          }
          await sleep((retryAfter + 1) * 1000);
          if (!error.config) throw error;
          return this.axiosRef.request(error.config);
        }
        if (error.response?.status === 403) {
          throw new ForbiddenException();
        }
        if (error.response?.status === 401) {
          throw new UnauthorizedException();
        }
        throw error;
      },
    );
  }

  private overrideConfig(config: AxiosRequestConfig): AxiosRequestConfig {
    if (!config.params) {
      config.params = {};
    }
    config.params.apiKey = this.apiKey;
    return config;
  }

  public override get<T = EtherscanPayload, D = unknown>(
    url: string,
    config?: AxiosRequestConfig<D>,
  ): Observable<AxiosResponse<T, D>> {
    const merged = { ...(config ?? {}) };
    const modifiedConfig = this.overrideConfig(merged);
    return super.get<T, D>(url, modifiedConfig);
  }

  public override post<T = EtherscanPayload, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Observable<AxiosResponse<T, D>> {
    const modifiedConfig = this.overrideConfig({ ...(config ?? {}) });
    return super.post<T, D>(url, data, modifiedConfig);
  }

  public override put<T = EtherscanPayload, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Observable<AxiosResponse<T, D>> {
    const modifiedConfig = this.overrideConfig({ ...(config ?? {}) });
    return super.put<T, D>(url, data, modifiedConfig);
  }

  public override patch<T = EtherscanPayload, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Observable<AxiosResponse<T, D>> {
    const modifiedConfig = this.overrideConfig({ ...(config ?? {}) });
    return super.patch<T, D>(url, data, modifiedConfig);
  }
}
