# @miinded/nestjs-web3-signature

## 2.0.0

### Major Changes

- db91720: Require Node.js >= 24 and refresh dependencies for security fixes.

  - `engines.node` is now `>=24` (Node.js 22 is no longer supported).
  - `@miinded/nestjs-web3-etherscan`: `axios` raised to `^1.20.0` (fixes several advisories).
  - `@miinded/nestjs-web3-contract`: `ethers` raised to `^6.17.0`.
  - Dependencies updated to their latest compatible versions.

### Patch Changes

- Updated dependencies [db91720]
  - @miinded/nestjs-blockchain-core@2.0.0

## 1.0.1

### Patch Changes

- 495105f: fix: resolve workspace protocol to actual versions for npm/yarn compatibility
- Updated dependencies [495105f]
  - @miinded/nestjs-blockchain-core@1.0.1
