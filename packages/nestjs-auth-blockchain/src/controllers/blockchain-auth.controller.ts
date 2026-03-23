import { Body, Controller, HttpException, HttpStatus, Request, Post, UseGuards, Logger, Get } from '@nestjs/common';
import { IBlockchainAuth } from '../interface/IBlockchainAuth.interface';
import { InjectBlockchainUser } from '../decorator';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { SignatureType } from '@miinded/nestjs-web3-signature';
import { formatNonceMessage } from '../utils';
import { BlockchainRefreshTokenGuard } from '../guards/blockchain-refresh-token.guard';

// Migration pour uniformiser les différentes provider de connexion
@Controller('auth')
export class BlockchainAuthController {
  private readonly logger = new Logger(BlockchainAuthController.name);

  constructor(
    @InjectBlockchainUser() private userService: IBlockchainAuth,
    private jwtService: JwtService,
  ) {}

  /**
   * Faire attention à la casse de la signature type qui doit obligatoirement être en minuscule. Il s'agit surement d'un problème eslint / compilation.
   */
  @Post('signature/nonce')
  generateNonceSignature(
    @Body() body: { networkId: number; wallet: string; domain: string; uri: string; signatureType: SignatureType },
  ) {
    let message: string | { message: string; wallet: string } | { message: string; address: string } =
      'Sign in with Ethereum to the app.';
    if ([SignatureType.SIMPLE, SignatureType.ADVANCED].includes(body.signatureType)) {
      message = formatNonceMessage(body.signatureType, body.wallet, 'Sign in with Ethereum to the app.');
    }

    if ([SignatureType.BIP322].includes(body.signatureType)) {
      message = formatNonceMessage(body.signatureType, body.wallet, 'Sign in with Bitcoin to the app.');
    }

    return this.userService
      .nonce(body.signatureType, body.networkId, body.wallet, body.domain, body.uri, message)
      .then(({ nonce, issuedAt }) => ({
        payload: {
          nonce,
          issuedAt,
        },
      }))
      .catch((error) => {
        this.logger.error(error);
        throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
      });
  }

  @UseGuards(AuthGuard('blockchain'))
  @Post('signature/login')
  async login(@Request() req: { user: { id: string; username?: string; wallet?: string } }) {
    const access_token = this.jwtService.sign({
      userId: req.user.id,
      username: req.user.username,
      wallet: req.user.wallet,
    });
    return {
      access_token,
      user: req.user,
    };
  }

  @UseGuards(BlockchainRefreshTokenGuard)
  @Get('refreshtoken')
  async refreshToken(@Request() req: { user: { id: string; username?: string; wallet?: string } }) {
    return req.user;
  }
}
