import { SignatureType } from '@miinded/nestjs-web3-signature';

const validData = (wallet: string, message: string) => {
  if (message === '') {
    throw new Error('You need to define message');
  }
  if (wallet === '') {
    throw new Error('You need to define wallet');
  }
};

export const formatBip32Message = (wallet: string, message: string): { message: string; address: string } => {
  validData(wallet, message);
  return { message, address: wallet };
};

export const formatAdvancedMessage = (wallet: string, message: string): { message: string; wallet: string } => {
  validData(wallet, message);
  return { message, wallet };
};

export const formatNonceMessage = (signatureType: SignatureType, wallet: string, message: string) => {
  let formattedMessage: string | { message: string; wallet: string } | { message: string; address: string } = message;
  if ([SignatureType.SIMPLE, SignatureType.ADVANCED].includes(signatureType)) {
    formattedMessage = formatAdvancedMessage(wallet, message);
  }

  if ([SignatureType.BIP322].includes(signatureType)) {
    formattedMessage = formatBip32Message(wallet, message);
  }
  return formattedMessage;
};
