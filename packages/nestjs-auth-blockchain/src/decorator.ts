import { Inject } from '@nestjs/common';
import { BLOCKCHAIN_USER_SERVICE } from './constants';

export const InjectBlockchainUser = (): ReturnType<typeof Inject> => Inject(BLOCKCHAIN_USER_SERVICE);
