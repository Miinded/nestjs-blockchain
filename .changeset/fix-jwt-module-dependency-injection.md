---
'@miinded/nestjs-auth-blockchain': patch
---

Fix JWT module dependency injection error by removing coreModule pattern

The JwtModule.registerAsync was unable to resolve BLOCKCHAIN_MODULE_OPTIONS when it was provided through a separate coreModule. This fix moves the provider directly into the main module's providers array, following the same pattern as AuthJwtModule.
