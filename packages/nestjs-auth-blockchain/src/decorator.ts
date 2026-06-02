import { Inject } from '@nestjs/common';
import { BLOCKCHAIN_USER_SERVICE, BLOCKCHAIN_JWT_OPTIONS } from './constants';

export const InjectBlockchainUser = (): ReturnType<typeof Inject> => Inject(BLOCKCHAIN_USER_SERVICE);
export const InjectBlockchainJWTConfig = (): ReturnType<typeof Inject> => Inject(BLOCKCHAIN_JWT_OPTIONS);
