# @miinded/nestjs-auth-blockchain

Production-ready NestJS module for blockchain-based authentication. Supports Web3 signature verification with JWT tokens.

## Installation

```sh
npm i @miinded/nestjs-auth-blockchain
```

## Features

- **Multi-signature support**: SIMPLE, ADVANCED (EIP-712), and SIWE (Sign-In with Ethereum)
- **JWT integration**: Automatic JWT token generation after successful authentication
- **Refresh token support**: Built-in refresh token strategy with configurable transport (header or cookie)
- **Passport integration**: Works with NestJS guards and middleware
- **Type-safe**: Full TypeScript support

## Usage

### 1. Create a user service implementing `IBlockchainAuth`

```typescript
import { Injectable } from '@nestjs/common';
import { IBlockchainAuth, IBlockchainAuthRefresh } from '@miinded/nestjs-auth-blockchain';
import { SignatureType } from '@miinded/nestjs-web3-signature';
import * as crypto from 'crypto';

@Injectable()
export class BlockchainUserService implements IBlockchainAuth, IBlockchainAuthRefresh {
  async getOneUserByWallet(wallet: string): Promise<unknown> {
    // Find user by wallet address
  }

  async nonce(
    signatureType: SignatureType,
    networkId: number,
    wallet: string,
    domain: string,
    uri: string,
    message: any,
  ) {
    const nonce = crypto.randomBytes(16).toString('hex');
    const issuedAt = new Date().toISOString();
    // Store nonce in cache
    return { nonce, issuedAt };
  }

  async get<T>(networkId: number, wallet: string, nonce: string): Promise<T> {
    // Retrieve stored nonce data
  }

  // Optional: Implement for refresh token support
  async getOneUserByUserId(userId: string): Promise<unknown> {
    // Find user by ID
  }

  async refreshTokenIsValid(userId: string, token: string): Promise<boolean> {
    // Validate refresh token
  }

  async invalidateRefreshToken(userId: string): Promise<void> {
    // Invalidate refresh token
  }

  async generateTokens(user: { userId: string; wallet?: string }) {
    // Generate new access and refresh tokens
    return { accessToken: '...', refreshAccessToken: '...' };
  }
}
```

### 2. Configure the module

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthBlockchainModule } from '@miinded/nestjs-auth-blockchain';
import { BlockchainUserService } from './blockchain-user.service';

@Module({
  imports: [
    AuthBlockchainModule.registerAsync({
      imports: [ConfigModule],
      userService: BlockchainUserService,
      useFactory: (config: ConfigService) => ({
        domains: config.get<string>('BLOCKCHAIN_DOMAIN').split('|'),
        token: {
          secret: config.get('BLOCKCHAIN_JWT_SECRET'),
          signOptions: { expiresIn: '8h' },
          transport: 'header', // 'header' or 'cookie'
        },
        refreshToken: {
          secret: config.get('BLOCKCHAIN_REFRESH_SECRET'),
          signOptions: { expiresIn: '7d' },
          transport: 'cookie', // 'header' or 'cookie'
          cookieName: 'refresh_token',
        },
      }),
      inject: [ConfigService],
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
import { BlockchainRefreshTokenGuard } from '@miinded/nestjs-auth-blockchain';

@Controller()
export class AppController {
  // Protect route with blockchain JWT
  @UseGuards(AuthGuard('blockchain-jwt'))
  @Get('protected')
  protected(@Request() req) {
    return req.user;
  }

  // Refresh token endpoint
  @UseGuards(BlockchainRefreshTokenGuard)
  @Get('auth/refresh')
  refresh(@Request() req) {
    return req.user; // Returns new tokens
  }
}
```

## Configuration

### JwtTokenOptions

| Property      | Type                   | Default                              | Description                             |
| ------------- | ---------------------- | ------------------------------------ | --------------------------------------- |
| `secret`      | `string`               | -                                    | JWT secret key                          |
| `signOptions` | `SignOptions`          | -                                    | JWT sign options (expiresIn, etc.)      |
| `transport`   | `'header' \| 'cookie'` | `'header'`                           | How to extract the token                |
| `cookieName`  | `string`               | `'access_token'` / `'refresh_token'` | Cookie name when using cookie transport |

### AuthBlockchainConfig

| Property       | Type                      | Required | Description                                |
| -------------- | ------------------------- | -------- | ------------------------------------------ |
| `domains`      | `string[]`                | Yes      | Allowed domains for signature verification |
| `token`        | `JwtTokenOptions`         | Yes      | Access token configuration                 |
| `refreshToken` | `JwtTokenOptions`         | Yes      | Refresh token configuration                |
| `providers`    | `AuthBlockchainSignature` | No       | Custom signature providers                 |
| `chainIds`     | `number[]`                | No       | Allowed chain IDs                          |

## License

MIT
