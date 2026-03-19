# @miinded/nestjs-auth-blockchain

Production-ready NestJS module for blockchain-based authentication. Supports Web3 signature verification with JWT tokens.

## Installation

```sh
npm i @miinded/nestjs-auth-blockchain
```

## Features

- **Multi-signature support**: SIMPLE, ADVANCED (EIP-712), and SIWE (Sign-In with Ethereum)
- **JWT integration**: Automatic JWT token generation after successful authentication
- **Passport integration**: Works with NestJS guards and middleware
- **Type-safe**: Full TypeScript support

## Usage

### 1. Create a user service implementing `IBlockchainAuth`

```typescript
import { Injectable } from '@nestjs/common';
import { IBlockchainAuth } from '@miinded/nestjs-auth-blockchain';
import { SignatureType } from '@miinded/nestjs-web3-signature';
import * as crypto from 'crypto';

@Injectable()
export class BlockchainUserService implements IBlockchainAuth {
  async getOneUserByWallet(wallet: string): Promise<unknown> {
    // Find user by wallet address
  }

  async nonce(signatureType: SignatureType, networkId: number, wallet: string, uri: string, message: any) {
    const nonce = crypto.randomBytes(16).toString('hex');
    const issuedAt = new Date().toISOString();
    // Store nonce in cache
    return { nonce, issuedAt };
  }

  async get<T>(networkId: number, wallet: string, nonce: string): Promise<T> {
    // Retrieve stored nonce data
  }
}
```

### 2. Configure the module

```typescript
import { Module } from '@nestjs/common';
import { AuthBlockchainModule } from '@miinded/nestjs-auth-blockchain';
import { BlockchainUserService } from './blockchain-user.service';

@Module({
  imports: [
    AuthBlockchainModule.registerAsync({
      userService: BlockchainUserService,
      useFactory: () => ({
        secret: 'your-jwt-secret',
        domain: 'localhost:3000',
      }),
    }),
  ],
  providers: [BlockchainUserService],
})
export class AppModule {}
```

### 3. Use with guards

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

## License

MIT
