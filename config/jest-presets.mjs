export const baseJestConfig = {
  verbose: true,
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'mjs', 'cjs', 'ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.ts$': '$1',
  },
  rootDir: '.',
  roots: ['src'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      '@swc/jest',
      {
        sourceMaps: 'inline',
        module: {
          type: 'commonjs',
        },
        jsc: {
          target: 'es2024',
          parser: {
            syntax: 'typescript',
            decorators: true,
          },
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
          },
        },
      },
    ],
  },
  resetModules: false,
};

export const unitJestConfig = {
  ...baseJestConfig,
  testRegex: '.*\\.unit\\.spec\\.ts$',
  forceExit: true,
};

export const intJestConfig = {
  ...baseJestConfig,
  testRegex: '.*\\.int\\.spec\\.ts$',
  forceExit: true,
};

export const e2eJestConfig = {
  ...baseJestConfig,
  testRegex: '.*\\.e2e\\.spec\\.ts$',
};

export const coverageJestConfig = {
  ...baseJestConfig,
  testRegex: '.*\\.(unit|int|e2e)\\.spec\\.ts$',
  forceExit: true,
  collectCoverage: true,
  coverageReporters: ['json', 'html', 'text-summary'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/index.ts'],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
};
