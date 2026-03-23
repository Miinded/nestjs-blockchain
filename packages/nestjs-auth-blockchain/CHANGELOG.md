# @miinded/nestjs-auth-blockchain

## 1.1.0

### Minor Changes

- 92f8984: Add refresh token support with configurable transport (header/cookie)
  - Add BlockchainRefreshTokenStrategy and BlockchainRefreshTokenGuard
  - Add IBlockchainAuthRefresh interface for refresh token methods
  - Add /auth/refreshtoken endpoint in BlockchainAuthController
  - Refactor JwtTokenOptions to include transport and cookieName per token
  - Update BlockchainJwtStrategy to support header or cookie transport
  - Update config: replace secret/domain with token/refreshToken/domains structure
  - Update README with new configuration examples

### Patch Changes

- bf80538: feat: add legacy config support for token/refreshToken/domains

## 1.0.1

### Patch Changes

- 495105f: fix: resolve workspace protocol to actual versions for npm/yarn compatibility
- Updated dependencies [495105f]
  - @miinded/nestjs-blockchain-core@1.0.1
  - @miinded/nestjs-web3-signature@1.0.1
