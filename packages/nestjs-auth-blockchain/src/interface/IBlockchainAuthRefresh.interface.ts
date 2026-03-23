export type BlockchainJWTGeneration = {
  accessToken: string;
  refreshAccessToken: string;
};

export interface IBlockchainAuthRefresh {
  getOneUserByUserId(userId: string): Promise<unknown>;
  refreshTokenIsValid(userId: string, token: string): Promise<boolean>;
  invalidateRefreshToken(userId: string): Promise<void>;
  generateTokens(user: { userId: string; wallet?: string }): Promise<BlockchainJWTGeneration>;
}
