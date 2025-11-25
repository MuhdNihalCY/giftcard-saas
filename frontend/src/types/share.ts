/**
 * Gift card sharing type definitions
 */

export interface ShareData {
  token: string;
  shareUrl: string;
  nfcData?: NFCShareData;
}

export interface NFCShareData {
  type: 'giftcard';
  id: string;
  code: string;
  shareToken: string;
  url: string;
  json?: string;
}


