import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class BlockchainRefreshTokenGuard extends AuthGuard('blockchain-refreshtoken') {}
