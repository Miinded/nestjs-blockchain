# @miinded/nestjs-web3-signature

Production-ready NestJS module for Web3 signature management. Supports EIP-712 typed data signing, SIWE (Sign-In with Ethereum), and simple message signing with full TypeScript support.

## Installation

```sh
npm i @miinded/nestjs-web3-signature
```

## Features

- **Simple Signature**: Basic message signing with SHA3 hashing
- **EIP-712 Typed Data**: Advanced typed data signing for structured messages
- **SIWE (Sign-In with Ethereum)**: Support for Sign-In with Ethereum protocol
- **Offline Support**: Works without blockchain connection for signature operations
- **Multi-provider**: Configure multiple blockchain providers

## Usage

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Web3SignatureModule } from '@miinded/nestjs-web3-signature';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [],
    }),
    Web3SignatureModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        return {
          ETH: {
            blockchainAddress: 'https://mainnet.infura.io/v3/<tokenId>',
            privateKey: '0xbe6383dad004f233317e46ddb46ad31b16064d14447a95cc1d8c8d4bc61c3728',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [],
})
export class MyBlockchainModule {}
```

## Signature Types

### Simple Signature

```typescript
const signature = signatureService.createSignature({ message: 'Hello' });
const recoveredAddress = await signatureService.recoverSignature(signature, { message: 'Hello' });
```

### EIP-712 Typed Data

```typescript
const typedMessage = eip712Service.generateTypedMessage(
  { Content: [{ name: 'message', type: 'string' }] },
  'Content',
  { message: 'Hello' },
  1,
  'MyContract',
  '0x1234...',
);
const signature = eip712Service.createSignature(typedMessage);
```

### SIWE (Sign-In with Ethereum)

```typescript
const siweMessage = new SiweMessage({
  domain: 'localhost:3000',
  address: '0x...',
  statement: 'Sign in to my app',
  uri: 'http://localhost:3000',
  version: '1',
  chainId: 1,
  nonce: 'random-nonce',
});
const signature = siweService.createSignature(siweMessage);
```

## License

MIT
