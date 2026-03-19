// WARNING: This is a test-only BTC private key (WIF uncompressed). DO NOT use in production or hold any funds on it.
// Source: https://privatekeys.pw/key/d821143048616020a807f5531579b4e14e903036f405dfd1aaac403b2863774a
// Note: bip322-js@2.0.0 uses wif@2.0.6 which does not support uncompressed WIF keys — bip322-js is mocked.
const btcPrivateKey = '5KN7MzqK5wt2TP1fQCYyHBtDrXdJuXbUzZjAvFAUpKgAmdoT1yd';
const btcAddress = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';
const fakeSignature = 'AkgwRQIhAMd7test+fakeSig==';

jest.mock('bip322-js', () => ({
  Signer: { sign: jest.fn() },
  Verifier: { verifySignature: jest.fn() },
}));

import { BIP322Service } from './BIP322.service';
import { Signer, Verifier } from 'bip322-js';

describe('BIP322Service', () => {
  let service: BIP322Service;
  let serviceWithoutKey: BIP322Service;

  beforeAll(() => {
    service = new BIP322Service(btcPrivateKey);
    serviceWithoutKey = new BIP322Service();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (Signer.sign as jest.Mock).mockReturnValue(fakeSignature);
    (Verifier.verifySignature as jest.Mock).mockReturnValue(true);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSignature', () => {
    it('should throw when private key is not defined', () => {
      expect(() => serviceWithoutKey.createSignature({ message: 'hello', address: btcAddress })).toThrow(
        'Private key is not defined',
      );
    });

    it('should create a signature', () => {
      const result = service.createSignature({ message: 'hello', address: btcAddress });
      expect(result).toBe(fakeSignature);
      expect(Signer.sign).toHaveBeenCalledWith(btcPrivateKey, btcAddress, JSON.stringify('hello'));
    });
  });

  describe('recoverSignature', () => {
    it('should return address for valid signature', async () => {
      const message = { message: 'hello', address: btcAddress };
      const result = await service.recoverSignature(fakeSignature, message);
      expect(result).toBe(btcAddress);
      expect(Verifier.verifySignature).toHaveBeenCalledWith(btcAddress, JSON.stringify('hello'), fakeSignature);
    });

    it('should throw for invalid signature', async () => {
      (Verifier.verifySignature as jest.Mock).mockReturnValue(false);
      const message = { message: 'hello', address: btcAddress };
      await expect(service.recoverSignature(fakeSignature, message)).rejects.toThrow(
        `Invalid signature for address ${btcAddress}`,
      );
    });
  });

  describe('getPublicKey', () => {
    it('should throw when private key is not defined', () => {
      expect(() => serviceWithoutKey.getPublicKey()).toThrow('Private key is not defined');
    });

    it('should throw not implemented for BTC', () => {
      expect(() => service.getPublicKey()).toThrow('getPublicKey not implemented for BTC');
    });
  });
});
