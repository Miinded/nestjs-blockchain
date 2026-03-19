import {
  EthExecutionAPI,
  JsonRpcResponseWithResult,
  Web3APIMethod,
  Web3APIPayload,
  Web3APIReturnType,
  Web3APISpec,
  Web3BaseProvider,
  Web3ProviderStatus,
} from 'web3-types';
import { MethodNotImplementedError } from 'web3-errors';

export default class OfflineProvider<API extends Web3APISpec = EthExecutionAPI> extends Web3BaseProvider<API> {
  /* eslint-disable class-methods-use-this */
  public getStatus(): Web3ProviderStatus {
    throw new MethodNotImplementedError();
  }

  /* eslint-disable class-methods-use-this */
  public supportsSubscriptions() {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async request<Method extends Web3APIMethod<API>, ResultType = Web3APIReturnType<API, Method>>(
    payload: Web3APIPayload<API, Method>,
    requestOptions?: RequestInit,
  ): Promise<JsonRpcResponseWithResult<ResultType>> {
    throw new MethodNotImplementedError();
  }

  /* eslint-disable class-methods-use-this */
  public on() {
    throw new MethodNotImplementedError();
  }

  /* eslint-disable class-methods-use-this */
  public removeListener() {
    throw new MethodNotImplementedError();
  }

  /* eslint-disable class-methods-use-this */
  public once() {
    throw new MethodNotImplementedError();
  }

  /* eslint-disable class-methods-use-this */
  public removeAllListeners() {
    throw new MethodNotImplementedError();
  }

  /* eslint-disable class-methods-use-this */
  public connect() {
    throw new MethodNotImplementedError();
  }

  /* eslint-disable class-methods-use-this */
  public disconnect() {
    throw new MethodNotImplementedError();
  }

  /* eslint-disable class-methods-use-this */
  public reset() {
    throw new MethodNotImplementedError();
  }

  /* eslint-disable class-methods-use-this */
  public reconnect() {
    throw new MethodNotImplementedError();
  }
}

export { OfflineProvider };
