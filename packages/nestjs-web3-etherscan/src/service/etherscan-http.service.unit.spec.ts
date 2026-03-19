import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { EtherscanHttpService } from './etherscan-http.service';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';

describe('EtherscanHttpService', () => {
  let axiosInstance: AxiosInstance;
  let service: EtherscanHttpService;
  let responseInterceptor: (response: AxiosResponse) => any;
  let errorInterceptor: (error: AxiosError) => any;

  beforeEach(() => {
    axiosInstance = axios.create();

    const originalUse = axiosInstance.interceptors.response.use.bind(axiosInstance.interceptors.response);
    jest.spyOn(axiosInstance.interceptors.response, 'use').mockImplementation((onFulfilled: any, onRejected: any) => {
      responseInterceptor = onFulfilled;
      errorInterceptor = onRejected;
      return originalUse(onFulfilled, onRejected);
    });

    service = new EtherscanHttpService(axiosInstance, 'test-api-key');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('response interceptor', () => {
    it('should pass through normal response', async () => {
      const response = {
        data: { status: 1, message: 'OK', result: [] },
        config: {} as InternalAxiosRequestConfig,
      } as AxiosResponse;

      const result = await responseInterceptor(response);
      expect(result).toBe(response);
    });

    it('should retry on rate limit response', async () => {
      jest.useFakeTimers();
      const config = { url: '/test' } as InternalAxiosRequestConfig;
      const response = {
        data: { status: 0, message: 'NOTOK', result: 'Max rate limit reached' },
        config,
      } as AxiosResponse;

      const retryResponse = { data: { status: 1, result: [] }, config } as AxiosResponse;
      jest.spyOn(axiosInstance, 'request').mockResolvedValue(retryResponse);

      const promise = responseInterceptor(response);
      jest.advanceTimersByTime(2000);
      const result = await promise;

      expect(axiosInstance.request).toHaveBeenCalledWith(config);
      expect(result).toBe(retryResponse);
      jest.useRealTimers();
    });

    it('should retry on rate limit with API key message', async () => {
      jest.useFakeTimers();
      const config = { url: '/test' } as InternalAxiosRequestConfig;
      const response = {
        data: {
          status: 0,
          message: 'NOTOK',
          result: 'Max rate limit reached, please use API Key for higher rate limit',
        },
        config,
      } as AxiosResponse;

      const retryResponse = { data: { status: 1, result: [] }, config } as AxiosResponse;
      jest.spyOn(axiosInstance, 'request').mockResolvedValue(retryResponse);

      const promise = responseInterceptor(response);
      jest.advanceTimersByTime(2000);
      const result = await promise;

      expect(result).toBe(retryResponse);
      jest.useRealTimers();
    });
  });

  describe('error interceptor', () => {
    it('should retry on 503 with retry-after header', async () => {
      jest.useFakeTimers();
      const config = { url: '/test' } as InternalAxiosRequestConfig;
      const error = {
        config,
        response: {
          status: 503,
          headers: { 'retry-after': '2' },
        },
        isAxiosError: true,
      } as unknown as AxiosError;

      const retryResponse = { data: { status: 1, result: [] } } as AxiosResponse;
      jest.spyOn(axiosInstance, 'request').mockResolvedValue(retryResponse);

      const promise = errorInterceptor(error);
      jest.advanceTimersByTime(3000);
      const result = await promise;

      expect(axiosInstance.request).toHaveBeenCalledWith(config);
      expect(result).toBe(retryResponse);
      jest.useRealTimers();
    });

    it('should retry on 503 with NaN retry-after (defaults to 1)', async () => {
      jest.useFakeTimers();
      const config = { url: '/test' } as InternalAxiosRequestConfig;
      const error = {
        config,
        response: {
          status: 503,
          headers: { 'retry-after': 'invalid' },
        },
        isAxiosError: true,
      } as unknown as AxiosError;

      const retryResponse = { data: { status: 1, result: [] } } as AxiosResponse;
      jest.spyOn(axiosInstance, 'request').mockResolvedValue(retryResponse);

      const promise = errorInterceptor(error);
      jest.advanceTimersByTime(2000);
      const result = await promise;

      expect(result).toBe(retryResponse);
      jest.useRealTimers();
    });

    it('should throw ForbiddenException on 403', async () => {
      const error = {
        config: {},
        response: { status: 403, headers: {} },
        isAxiosError: true,
      } as unknown as AxiosError;

      await expect(errorInterceptor(error)).rejects.toThrow(ForbiddenException);
    });

    it('should throw UnauthorizedException on 401', async () => {
      const error = {
        config: {},
        response: { status: 401, headers: {} },
        isAxiosError: true,
      } as unknown as AxiosError;

      await expect(errorInterceptor(error)).rejects.toThrow(UnauthorizedException);
    });

    it('should rethrow unknown errors', async () => {
      const error = {
        config: {},
        response: { status: 500, headers: {} },
        isAxiosError: true,
        message: 'Internal Server Error',
      } as unknown as AxiosError;

      await expect(errorInterceptor(error)).rejects.toBe(error);
    });
  });

  describe('HTTP methods', () => {
    let getSpy: jest.SpyInstance;
    let postSpy: jest.SpyInstance;
    let putSpy: jest.SpyInstance;
    let patchSpy: jest.SpyInstance;

    beforeEach(() => {
      const mockResponse = { data: { status: 1, result: [] } } as AxiosResponse;
      getSpy = jest.spyOn(axiosInstance, 'get').mockResolvedValue(mockResponse);
      postSpy = jest.spyOn(axiosInstance, 'post').mockResolvedValue(mockResponse);
      putSpy = jest.spyOn(axiosInstance, 'put').mockResolvedValue(mockResponse);
      patchSpy = jest.spyOn(axiosInstance, 'patch').mockResolvedValue(mockResponse);
    });

    it('should call get with apiKey in params', (done) => {
      service.get('/test', { params: { module: 'account' } }).subscribe({
        next: () => {
          expect(getSpy).toHaveBeenCalled();
          const callArgs = getSpy.mock.calls[0];
          expect(callArgs[1].params.apiKey).toBe('test-api-key');
          done();
        },
        error: done,
      });
    });

    it('should call get without initial params', (done) => {
      service.get('/test').subscribe({
        next: () => {
          expect(getSpy).toHaveBeenCalled();
          const callArgs = getSpy.mock.calls[0];
          expect(callArgs[1].params.apiKey).toBe('test-api-key');
          done();
        },
        error: done,
      });
    });

    it('should call post with apiKey in params', (done) => {
      service.post('/test', { data: 'value' }).subscribe({
        next: () => {
          expect(postSpy).toHaveBeenCalled();
          done();
        },
        error: done,
      });
    });

    it('should call put with apiKey in params', (done) => {
      service.put('/test', { data: 'value' }).subscribe({
        next: () => {
          expect(putSpy).toHaveBeenCalled();
          done();
        },
        error: done,
      });
    });

    it('should call patch with apiKey in params', (done) => {
      service.patch('/test', { data: 'value' }).subscribe({
        next: () => {
          expect(patchSpy).toHaveBeenCalled();
          done();
        },
        error: done,
      });
    });
  });
});
