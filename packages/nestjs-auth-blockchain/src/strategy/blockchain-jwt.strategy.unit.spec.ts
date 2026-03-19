import { BlockchainJwtStrategy } from './blockchain-jwt.strategy';

describe('BlockchainJwtStrategy', () => {
  let strategy: BlockchainJwtStrategy;

  beforeEach(() => {
    strategy = new BlockchainJwtStrategy('test-secret');
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
});
