import { BlockchainJwtStrategy } from './blockchain-jwt.strategy';
import { JwtTokenOptions } from '../auth-blockchain.module';

describe('BlockchainJwtStrategy', () => {
  let strategy: BlockchainJwtStrategy;

  const createTokenOptions = (overrides: Partial<JwtTokenOptions> = {}): JwtTokenOptions => ({
    secret: 'test-secret',
    ...overrides,
  });

  beforeEach(() => {
    strategy = new BlockchainJwtStrategy(createTokenOptions());
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should validate payload', async () => {
    const payload = { userId: '1', username: 'test', wallet: '0x1234567890abcdef' };
    const result = await strategy.validate(payload);
    expect(result).toEqual(payload);
  });

  it('should validate empty payload', async () => {
    const payload = {};
    const result = await strategy.validate(payload);
    expect(result).toEqual(payload);
  });

  it('should validate payload with additional fields', async () => {
    const payload = { userId: '1', username: 'test', wallet: '0x1234567890abcdef', extra: 'field' };
    const result = await strategy.validate(payload);
    expect(result).toEqual(payload);
  });

  it('should create strategy with header transport by default', () => {
    const strategyWithDefaults = new BlockchainJwtStrategy(createTokenOptions());
    expect(strategyWithDefaults).toBeDefined();
  });

  it('should create strategy with cookie transport', () => {
    const strategyWithCookie = new BlockchainJwtStrategy(
      createTokenOptions({ transport: 'cookie', cookieName: 'my_token' }),
    );
    expect(strategyWithCookie).toBeDefined();
  });
});
