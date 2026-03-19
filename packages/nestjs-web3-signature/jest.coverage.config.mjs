import { coverageJestConfig } from '../../config/jest-presets.mjs';

export default {
  ...coverageJestConfig,
  collectCoverageFrom: [
    ...(coverageJestConfig.collectCoverageFrom ?? []),
    '!src/service/base-signature.service.ts',
    '!src/service/base-btc-signature.service.ts',
    '!src/service/offline-provider.service.ts',
  ],
};
