import { unitJestConfig } from '../../config/jest-presets.mjs';

export default {
  ...unitJestConfig,
  collectCoverageFrom: ['src/**/*.ts', '!src/**/index.ts', '!src/**/offline-provider.service.ts'],
};
