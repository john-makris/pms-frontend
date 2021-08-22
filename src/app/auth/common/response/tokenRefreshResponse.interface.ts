export interface TokenRefreshResponse {
    tokenType: string;
    accessToken: string;
    accessTokenExpiryDate: Date;
	refreshToken: string;
	refreshTokenExpiryDate: Date;
}