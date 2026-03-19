import { Strategy } from 'passport-strategy';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { IBlockchainAuth } from '../interface/IBlockchainAuth.interface';
import { NonceCheckerService } from '../service/nonce-checker.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Request = any;

export class PassportAuthBlockchainStrategy extends Strategy {
  private readonly logger = new Logger(PassportAuthBlockchainStrategy.name);

  userService: IBlockchainAuth;
  nonceCheckerService: NonceCheckerService;
  domains: string[];
  chainIds: number[];

  constructor(
    domains: string[],
    chainIds: number[],
    userService: IBlockchainAuth,
    nonceCheckerService: NonceCheckerService,
  ) {
    super();
    this.userService = userService;
    this.domains = domains;
    this.chainIds = chainIds;
    this.nonceCheckerService = nonceCheckerService;
  }

  authenticate(request: Request) {
    this.validateUser(request)
      .then((user) => {
        request.user = user as Express.User;
        this.success(request.user);
      })
      .catch((error) => {
        if (error instanceof TypeError) {
          this.fail(error, 400);
        } else if (error.response?.statusCode) {
          this.fail(error.response, error.response.statusCode);
        } else {
          this.fail(error, 400);
        }
      });
  }

  async validateUser(request: Request) {
    const { networkid: stringNetworkId, wallet, signature, nonce } = request.headers;
    const networkId = parseInt(stringNetworkId as string);
    if (!networkId || !signature || !wallet || !nonce) {
      this.logger.error('Invalid arguments');
      throw new TypeError('Invalid arguments');
    }

    if (this.chainIds.length > 0 && !this.chainIds.includes(networkId)) {
      this.logger.error('Chain is not allowed');
      throw new UnauthorizedException('Chain is not allowed');
    }

    try {
      await this.nonceCheckerService.signIsValid(
        stringNetworkId as string,
        this.domains,
        wallet as string,
        nonce as string,
        signature as string,
      );
    } catch (error) {
      this.logger.error('Bad signature', error);
      throw new UnauthorizedException(error instanceof Error ? error.message : String(error));
    }

    const user = await this.userService.getOneUserByWallet(wallet as string);
    if (!user) {
      this.logger.error('User not found');
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
