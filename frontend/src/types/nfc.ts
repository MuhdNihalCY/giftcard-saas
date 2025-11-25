/**
 * NFC-related type definitions
 */

export interface NFCData {
  type: 'giftcard';
  id: string;
  code: string;
  shareToken: string;
  url: string;
}

export interface PlatformInfo {
  isNFCAvailable: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  isDesktop: boolean;
  userAgent: string;
}

// NDEF Record types (for Web NFC API)
export interface NDEFRecord {
  recordType: string;
  mediaType?: string;
  data: ArrayBuffer | DataView;
}

export interface NDEFMessage {
  records: NDEFRecord[];
}

export interface NDEFReadingEvent extends Event {
  message: NDEFMessage;
  serialNumber?: string;
}


