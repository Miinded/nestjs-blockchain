export type EtherscanPayload<T = any> = {
  status: number;
  message: string;
  result: T;
};

export type EtherscanLogsResponse = {
  address: string;
  topics: string[];
  data: string;
  blockHash: string;
  blockNumber: string;
  timeStamp: string;
  gasPrice: string;
  gasUsed: string;
  transactionHash: string;
  transactionIndex: string;
  logIndex: string;
};

export type EtherscanTransferResponse = {
  hash: string;
  nonce: string;
  blockHash: string;
  blockNumber: string;
  timeStamp: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  gasUsed: string;
  cumulativeGasUsed: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  confirmations: string;
  methodId: string;
  functionName: string;
};

export type EtherscanPriceResponse = {
  ethbtc: string;
  ethbtc_timestamp: string;
  ethusd: string;
  ethusd_timestamp: string;
};

export type EtherscanOrder = 'ASC' | 'DESC';
