import { SignatureType } from '@miinded/nestjs-web3-signature';
import { formatAdvancedMessage, formatBip32Message, formatNonceMessage } from './utils';

describe('utils', () => {
  describe('formatAdvancedMessage', () => {
    it('should return message with wallet', () => {
      const result = formatAdvancedMessage('0xWALLET', 'hello');
      expect(result).toEqual({ message: 'hello', wallet: '0xWALLET' });
    });

    it('should throw when message is empty', () => {
      expect(() => formatAdvancedMessage('0xWALLET', '')).toThrow('You need to define message');
    });

    it('should throw when wallet is empty', () => {
      expect(() => formatAdvancedMessage('', 'hello')).toThrow('You need to define wallet');
    });
  });

  describe('formatBip32Message', () => {
    it('should return message with address', () => {
      const result = formatBip32Message('0xADDRESS', 'hello');
      expect(result).toEqual({ message: 'hello', address: '0xADDRESS' });
    });

    it('should throw when message is empty', () => {
      expect(() => formatBip32Message('0xADDRESS', '')).toThrow('You need to define message');
    });

    it('should throw when wallet is empty', () => {
      expect(() => formatBip32Message('', 'hello')).toThrow('You need to define wallet');
    });
  });

  describe('formatNonceMessage', () => {
    it('should format SIMPLE signature type', () => {
      const result = formatNonceMessage(SignatureType.SIMPLE, '0xWALLET', 'Sign in');
      expect(result).toEqual({ message: 'Sign in', wallet: '0xWALLET' });
    });

    it('should format ADVANCED signature type', () => {
      const result = formatNonceMessage(SignatureType.ADVANCED, '0xWALLET', 'Sign in');
      expect(result).toEqual({ message: 'Sign in', wallet: '0xWALLET' });
    });

    it('should format BIP322 signature type', () => {
      const result = formatNonceMessage(SignatureType.BIP322, '0xADDRESS', 'Sign in with Bitcoin');
      expect(result).toEqual({ message: 'Sign in with Bitcoin', address: '0xADDRESS' });
    });

    it('should return plain string for SIWE signature type', () => {
      const result = formatNonceMessage(SignatureType.SIWE, '0xWALLET', 'Sign in with Ethereum');
      expect(result).toBe('Sign in with Ethereum');
    });
  });
});
