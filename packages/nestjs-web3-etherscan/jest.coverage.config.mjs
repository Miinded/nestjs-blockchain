import { coverageJestConfig } from '../../config/jest-presets.mjs';

export default {
  ...coverageJestConfig,
  collectCoverageFrom: [...(coverageJestConfig.collectCoverageFrom ?? []), '!src/interfaces/**/*'],
};
