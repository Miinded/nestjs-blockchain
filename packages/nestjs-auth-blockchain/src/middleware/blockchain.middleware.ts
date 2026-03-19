import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';

@Injectable()
export class BlockchainMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    passport.authenticate(
      'blockchain',
      (
        err: any,
        user?: Express.User | false | null,
        info?: object | string | Array<string | undefined>,
        status?: number | Array<number | undefined>,
      ) => {
        if (!user) {
          res.status(401).json({
            statusCode: 401,
            message: 'Unauthorized',
          });
          return;
        }
        next();
      },
    )(req, res, next);
  }
}
