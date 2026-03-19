import { coverageJestConfig } from '../../config/jest-presets.mjs';

export default {
  ...coverageJestConfig,
  collectCoverageFrom: [
    ...(coverageJestConfig.collectCoverageFrom ?? []),
    '!src/interfaces/**/*',
    '!src/service/base-contract.service.ts',
    '!src/service/contract.manager.ts',
  ],
};
