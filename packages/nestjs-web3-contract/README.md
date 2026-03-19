# @miinded/nestjs-web3-contract

Production-ready NestJS module for Web3 smart contract interactions. Supports ERC20, ERC721, ERC1155 standards with full TypeScript support.

## Installation

```sh
npm i @miinded/nestjs-web3-contract
```

## Features

- **ERC20 Support**: Standard ERC20 token operations (balance, transfer, approve, etc.)
- **ERC721 Support**: NFT standard operations (balanceOf, ownerOf, transfer, etc.)
- **ERC1155 Support**: Multi-token standard operations
- **Custom Contracts**: Extend base service for custom contract methods
- **ENS Resolution**: Automatic ENS name resolution
- **Multi-blockchain**: Configure multiple blockchain providers

## Usage

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Web3ContractModule } from '@miinded/nestjs-web3-contract';
import { ConfigService } from '@nestjs/config';
import * as CryptoFoxes from './abi/CryptoFoxes.json';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [],
    }),
    Web3ContractModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const config = {};
        for (const blockchain of ['ETH']) {
          config[blockchain] = {
            blockchainAddress: configService.get(`${blockchain}_BLOCKCHAIN_ADDRESS`),
            contracts: [
              {
                contractType: 'ERC721',
                name: 'Cryptofoxes',
                contractAddress: '0xA9FdB3F96fAE7C12D70393659867c6115683AdA0',
                abi: CryptoFoxes.abi,
              },
            ],
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

## Custom Contract Service

```typescript
import { Injectable } from '@nestjs/common';
import { ERC721Service } from '@miinded/nestjs-web3-contract';

@Injectable()
export class CfxService extends ERC721Service {
  async MAX_FOXES(): Promise<string> {
    return this.call<string>('MAX_FOXES');
  }
}
```

## License

MIT
