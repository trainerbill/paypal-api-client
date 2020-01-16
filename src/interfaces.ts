export interface IPayPalAccessToken {
  scope: string;
  access_token: string;
  token_type: string;
  app_id: string;
  expires_in: number;
  expires_at: number;
  nonce: string;
}
