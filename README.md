# @miinded/nestjs-blockchain

A collection of production-ready NestJS modules for blockchain integration — Web3 signatures, smart contracts, Etherscan API, and blockchain-based authentication.

<p align="center">
  <a href="https://github.com/miinded/nestjs-blockchain/actions/workflows/quality.yml"><img src="https://github.com/miinded/nestjs-blockchain/actions/workflows/quality.yml/badge.svg?branch=main" alt="CI" /></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT" /></a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@miinded/nestjs-blockchain-core"><img src="https://img.shields.io/npm/v/@miinded/nestjs-blockchain-core.svg?label=nestjs-blockchain-core" alt="npm nestjs-blockchain-core" /></a>
  <a href="https://www.npmjs.com/package/@miinded/nestjs-web3-signature"><img src="https://img.shields.io/npm/v/@miinded/nestjs-web3-signature.svg?label=nestjs-web3-signature" alt="npm nestjs-web3-signature" /></a>
  <a href="https://www.npmjs.com/package/@miinded/nestjs-web3-contract"><img src="https://img.shields.io/npm/v/@miinded/nestjs-web3-contract.svg?label=nestjs-web3-contract" alt="npm nestjs-web3-contract" /></a>
  <a href="https://www.npmjs.com/package/@miinded/nestjs-web3-etherscan"><img src="https://img.shields.io/npm/v/@miinded/nestjs-web3-etherscan.svg?label=nestjs-web3-etherscan" alt="npm nestjs-web3-etherscan" /></a>
  <a href="https://www.npmjs.com/package/@miinded/nestjs-auth-blockchain"><img src="https://img.shields.io/npm/v/@miinded/nestjs-auth-blockchain.svg?label=nestjs-auth-blockchain" alt="npm nestjs-auth-blockchain" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D22-brightgreen" alt="Node.js >= 22" />
  <img src="https://img.shields.io/badge/NestJS-10.x%20%7C%2011.x-ea2845" alt="NestJS 10.x | 11.x" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6" alt="TypeScript 5.x" />
  <img src="https://img.shields.io/badge/pnpm-monorepo-f69220" alt="pnpm monorepo" />
</p>

## Compatibility

| Dependency | Supported versions |
| ---------- | ------------------ |
| Node.js    | `>= 22`            |
| NestJS     | `10.x` · `11.x`    |
| TypeScript | `5.x`              |
| RxJS       | `7.x`              |

## Packages

| Package                                                                | Description                                                       |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------- |
| [`@miinded/nestjs-blockchain-core`](./packages/nestjs-blockchain-core) | Core types and utilities shared across blockchain packages        |
| [`@miinded/nestjs-web3-signature`](./packages/nestjs-web3-signature)   | Web3 signature management — SIMPLE, EIP-712, and SIWE             |
| [`@miinded/nestjs-web3-contract`](./packages/nestjs-web3-contract)     | Smart contract interactions — ERC20, ERC721, ERC1155              |
| [`@miinded/nestjs-web3-etherscan`](./packages/nestjs-web3-etherscan)   | Etherscan API integration with multi-chain and retry support      |
| [`@miinded/nestjs-auth-blockchain`](./packages/nestjs-auth-blockchain) | Blockchain-based authentication with JWT and Passport integration |

## Installation

```bash
# Core types (required by other packages)
pnpm add @miinded/nestjs-blockchain-core

# Web3 signature management
pnpm add @miinded/nestjs-web3-signature

# Smart contract interactions
pnpm add @miinded/nestjs-web3-contract

# Etherscan API
pnpm add @miinded/nestjs-web3-etherscan

# Blockchain authentication
pnpm add @miinded/nestjs-auth-blockchain
```

## Features

- **Multi-signature support** — SIMPLE (SHA3), EIP-712 typed data, and SIWE (Sign-In with Ethereum)
- **Smart contract standards** — ERC20, ERC721, ERC1155 with extensible base services
- **Etherscan integration** — Multi-chain API with automatic retry and rate limiting
- **Blockchain authentication** — Wallet-based login with JWT token generation via Passport
- **Async configuration** — `registerAsync` with factory injection and `ConfigService` support
- **Offline signature support** — Signature operations without live blockchain connection
- **TypeScript first** — Full type definitions with exported interfaces
- **Dual CJS/ESM** — Both CommonJS and ES module builds included

---

## Web3 Signature

### Register the module

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Web3SignatureModule } from '@miinded/nestjs-web3-signature';

@Module({
  imports: [
    Web3SignatureModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ETH: {
          blockchainAddress: config.getOrThrow('ETH_BLOCKCHAIN_ADDRESS'),
          privateKey: config.getOrThrow('ETH_PRIVATE_KEY'),
        },
      }),
    }),
  ],
})
export class AppModule {}
```

### Signature types

```typescript
// Simple (SHA3)
const signature = signatureService.createSignature({ message: 'Hello' });
const address = await signatureService.recoverSignature(signature, { message: 'Hello' });

// EIP-712
const typedMessage = eip712Service.generateTypedMessage(
  { Content: [{ name: 'message', type: 'string' }] },
  'Content',
  { message: 'Hello' },
  1,
  'MyContract',
  '0x1234...',
);
const sig = eip712Service.createSignature(typedMessage);

// SIWE
const siweMessage = new SiweMessage({
  domain: 'localhost:3000',
  address: '0x...',
  statement: 'Sign in to my app',
  uri: 'http://localhost:3000',
  version: '1',
  chainId: 1,
  nonce: 'random-nonce',
});
const siweSig = siweService.createSignature(siweMessage);
```

---

## Web3 Smart Contracts

### Register the module

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Web3ContractModule } from '@miinded/nestjs-web3-contract';
import * as MyNFT from './abi/MyNFT.json';

@Module({
  imports: [
    Web3ContractModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ETH: {
          blockchainAddress: config.getOrThrow('ETH_BLOCKCHAIN_ADDRESS'),
          contracts: [
            {
              contractType: 'ERC721',
              name: 'MyNFT',
              contractAddress: '0xA9FdB3F96fAE7C12D70393659867c6115683AdA0',
              abi: MyNFT.abi,
            },
          ],
        },
      }),
    }),
  ],
})
export class AppModule {}
```

### Extend for custom methods

```typescript
import { Injectable } from '@nestjs/common';
import { ERC721Service } from '@miinded/nestjs-web3-contract';

@Injectable()
export class MyNFTService extends ERC721Service {
  async maxSupply(): Promise<string> {
    return this.call<string>('MAX_SUPPLY');
  }
}
```

---

## Etherscan API

### Register the module

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Web3EtherscanModule } from '@miinded/nestjs-web3-etherscan';

@Module({
  imports: [
    Web3EtherscanModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ETH: {
          blockchainAddress: config.getOrThrow('ETH_BLOCKCHAIN_ADDRESS'),
          apiUrl: config.getOrThrow('ETH_ETHERSCAN_URL'),
          apiKey: config.getOrThrow('ETH_ETHERSCAN_KEY'),
        },
      }),
    }),
  ],
})
export class AppModule {}
```

---

## Blockchain Authentication

### Implement the `IBlockchainAuth` interface

```typescript
import { Injectable } from '@nestjs/common';
import { IBlockchainAuth } from '@miinded/nestjs-auth-blockchain';
import { SignatureType } from '@miinded/nestjs-web3-signature';
import * as crypto from 'crypto';

@Injectable()
export class BlockchainUserService implements IBlockchainAuth {
  async getOneUserByWallet(wallet: string): Promise<unknown> {
    return this.usersRepository.findOne({ where: { wallet } });
  }

  async nonce(signatureType: SignatureType, networkId: number, wallet: string, uri: string, message: any) {
    const nonce = crypto.randomBytes(16).toString('hex');
    const issuedAt = new Date().toISOString();
    await this.cacheManager.set(`nonce:${wallet}`, { nonce, issuedAt }, 300);
    return { nonce, issuedAt };
  }

  async get<T>(networkId: number, wallet: string, nonce: string): Promise<T> {
    return this.cacheManager.get(`nonce:${wallet}`);
  }
}
```

### Register the module

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthBlockchainModule } from '@miinded/nestjs-auth-blockchain';
import { BlockchainUserService } from './blockchain-user.service';

@Module({
  imports: [
    AuthBlockchainModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      userService: BlockchainUserService,
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_SECRET'),
        domain: config.getOrThrow('APP_DOMAIN'),
        chainIds: [1, 137],
      }),
    }),
  ],
  providers: [BlockchainUserService],
})
export class AppModule {}
```

### Protect routes

```typescript
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  @UseGuards(AuthGuard('blockchain'))
  @Get('protected')
  protected(@Request() req) {
    return req.user;
  }
}
```

---

## API Reference

### `Web3SignatureModule.registerAsync(options)`

| Option       | Type                            | Required | Description                         |
| ------------ | ------------------------------- | -------- | ----------------------------------- |
| `useFactory` | `(...args) => BlockchainConfig` | ✅       | Factory returning blockchain config |
| `inject`     | `any[]`                         | ❌       | Dependencies to inject into factory |
| `imports`    | `Module[]`                      | ❌       | Modules to import                   |

### `AuthBlockchainModule.registerAsync(options)`

| Option        | Type                                | Required | Description                          |
| ------------- | ----------------------------------- | -------- | ------------------------------------ |
| `userService` | `Type<IBlockchainAuth>`             | ✅       | Class implementing `IBlockchainAuth` |
| `useFactory`  | `(...args) => BlockchainAuthConfig` | ❌       | Factory returning auth config        |
| `inject`      | `any[]`                             | ❌       | Dependencies to inject into factory  |
| `imports`     | `Module[]`                          | ❌       | Modules to import                    |

## Development

```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages
pnpm test:unit        # Run unit tests
pnpm test:coverage    # Run tests with coverage report
pnpm lint             # Lint all packages
pnpm format:check     # Check formatting
pnpm deps:check       # Verify dependency policy
pnpm ci:quality       # Run full CI quality pipeline locally
```

### Test conventions

| Type        | Pattern          | Command          |
| ----------- | ---------------- | ---------------- |
| Unit        | `*.unit.spec.ts` | `pnpm test:unit` |
| Integration | `*.int.spec.ts`  | `pnpm test:int`  |
| E2E         | `*.e2e.spec.ts`  | `pnpm test:e2e`  |

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit using [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, …)
4. Add or update tests for your changes
5. Run `pnpm ci:quality` to validate locally
6. Open a pull request against `main`

## Changelog

This project uses [Changesets](https://github.com/changesets/changesets) for versioning and changelog generation. See the release history in each package:

- [`@miinded/nestjs-blockchain-core` changelog](./packages/nestjs-blockchain-core/CHANGELOG.md)
- [`@miinded/nestjs-web3-signature` changelog](./packages/nestjs-web3-signature/CHANGELOG.md)
- [`@miinded/nestjs-web3-contract` changelog](./packages/nestjs-web3-contract/CHANGELOG.md)
- [`@miinded/nestjs-web3-etherscan` changelog](./packages/nestjs-web3-etherscan/CHANGELOG.md)
- [`@miinded/nestjs-auth-blockchain` changelog](./packages/nestjs-auth-blockchain/CHANGELOG.md)

## License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/miinded">Miinded</a>
</p>
