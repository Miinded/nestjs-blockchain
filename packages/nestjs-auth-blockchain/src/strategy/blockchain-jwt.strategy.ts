import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { JwtTokenOptions } from '../auth-blockchain.module';

@Injectable()
export class BlockchainJwtStrategy extends PassportStrategy(Strategy, 'blockchain-jwt') {
  constructor(token: JwtTokenOptions) {
    const transport = token.transport ?? 'header';
    const cookieName = token.cookieName ?? 'access_token';
    const jwtFromRequest =
      transport === 'cookie' ? (req: Request) => req.cookies?.[cookieName] : ExtractJwt.fromAuthHeaderAsBearerToken();

    super({
      jwtFromRequest,
      ignoreExpiration: false,
      secretOrKey: token.secret as string,
    });
  }

  async validate(payload: any) {
    return payload;
  }
}
