import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { IBlockchainAuthRefresh } from '../interface/IBlockchainAuthRefresh.interface';
import { JwtTokenOptions } from '../auth-blockchain.module';

export type BlockchainJwtPayload = {
  userId: string;
  wallet?: string;
};

@Injectable()
export class BlockchainRefreshTokenStrategy extends PassportStrategy(Strategy, 'blockchain-refreshtoken') {
  constructor(
    token: JwtTokenOptions,
    readonly userService: IBlockchainAuthRefresh,
  ) {
    const transport = token.transport ?? 'header';
    const cookieName = token.cookieName ?? 'refresh_token';
    const jwtFromRequest =
      transport === 'cookie' ? (req: Request) => req.cookies?.[cookieName] : ExtractJwt.fromAuthHeaderAsBearerToken();

    super({
      jwtFromRequest,
      ignoreExpiration: false,
      secretOrKey: token.secret as string,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: BlockchainJwtPayload) {
    const refreshToken = req.cookies?.['refresh_token'] || req.get('Authorization')?.replace('Bearer', '').trim();

    if (!refreshToken || !(await this.userService.refreshTokenIsValid(payload.userId, refreshToken))) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = (await this.userService.getOneUserByUserId(payload.userId)) as { id: string; wallet?: string };
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return await this.userService.generateTokens({ userId: user.id, wallet: user.wallet });
  }
}
