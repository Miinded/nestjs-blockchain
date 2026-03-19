import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { PassportAuthBlockchainStrategy } from './passport-auth-blockchain.strategy';
import { IBlockchainAuth } from '../interface/IBlockchainAuth.interface';
import { NonceCheckerService } from '../service/nonce-checker.service';

@Injectable()
export class MyPassportAuthBlockchainStrategy extends PassportStrategy(PassportAuthBlockchainStrategy, 'blockchain') {
  constructor(
    readonly domains: string[],
    readonly chainIds: number[],
    readonly userService: IBlockchainAuth,
    readonly nonceCheckerService: NonceCheckerService,
  ) {
    super(domains, chainIds, userService, nonceCheckerService);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validate(..._args: unknown[]): unknown {
    return;
  }
}
