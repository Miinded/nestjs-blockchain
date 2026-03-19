# @miinded/nestjs-web3-etherscan

Production-ready NestJS module for Etherscan API integration. Supports multiple blockchains with automatic retry and rate limiting.

## Installation

```sh
npm i @miinded/nestjs-web3-etherscan
```

## Features

- **Multi-blockchain support**: Configure multiple Etherscan-compatible APIs
- **Automatic retry**: Built-in rate limit handling with automatic retry
- **Type-safe**: Full TypeScript support with proper types
- **NestJS integration**: Seamless integration with NestJS dependency injection

## Usage

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Web3EtherscanModule } from '@miinded/nestjs-web3-etherscan';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [],
    }),
    Web3EtherscanModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const config = {};
        for (const blockchain of ['ETH', 'GOERLI']) {
          config[blockchain] = {
            blockchainAddress: configService.get(`${blockchain}_BLOCKCHAIN_ADDRESS`),
            apiUrl: configService.get(`${blockchain}_API_URL`),
            apiKey: configService.get(`${blockchain}_API_KEY`),
          };
        }
        return config;
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [],
})
export class MyBlockchainModule {}
```

## API Methods

- `listLogs(address, startblock, endblock, topic)` - Get event logs
- `getAbi(address)` - Get contract ABI
- `listTransactions(address, startblock, endblock, sort)` - Get transaction list
- `getCurrentBlock(safe)` - Get current block number
- `getCurrencyPrice()` - Get ETH price

## License

MIT
