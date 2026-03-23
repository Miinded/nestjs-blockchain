---
'@miinded/nestjs-auth-blockchain': minor
---

Add refresh token support with configurable transport (header/cookie)

- Add BlockchainRefreshTokenStrategy and BlockchainRefreshTokenGuard
- Add IBlockchainAuthRefresh interface for refresh token methods
- Add /auth/refreshtoken endpoint in BlockchainAuthController
- Refactor JwtTokenOptions to include transport and cookieName per token
- Update BlockchainJwtStrategy to support header or cookie transport
- Update config: replace secret/domain with token/refreshToken/domains structure
- Update README with new configuration examples
