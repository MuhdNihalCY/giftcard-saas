/**
 * NFC Service for gift card sharing
 * Supports Web NFC API on Android Chrome with fallbacks for other platforms
 */

interface NFCData {
  type: string;
  id: string;
  code: string;
  shareToken: string;
  url: string;
}

export class NFCService {
  /**
   * Check if Web NFC API is available
   */
  static isNFCAvailable(): boolean {
    return 'NDEFReader' in window || 'nfc' in navigator;
  }

  /**
   * Check if device is Android
   */
  static isAndroid(): boolean {
    return /Android/i.test(navigator.userAgent);
  }

  /**
   * Check if device is iOS
   */
  static isIOS(): boolean {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  }

  /**
   * Get platform capabilities
   */
  static getPlatformInfo() {
    return {
      isNFCAvailable: this.isNFCAvailable(),
      isAndroid: this.isAndroid(),
      isIOS: this.isIOS(),
      isDesktop: !this.isAndroid() && !this.isIOS(),
      userAgent: navigator.userAgent,
    };
  }

  /**
   * Write NFC data (Android Chrome only)
   */
  static async writeNFC(data: NFCData): Promise<void> {
    if (!this.isNFCAvailable()) {
      throw new Error('NFC is not available on this device. Please use QR code or share link instead.');
    }

    if (!this.isAndroid()) {
      throw new Error('NFC writing is only supported on Android devices. Please use QR code or share link instead.');
    }

    try {
      // Use Web NFC API
      const ndef = new (window as any).NDEFReader();
      
      // Encode data properly for NDEF
      const encoder = new TextEncoder();
      const jsonData = JSON.stringify(data);
      
      // Convert data to NDEF message format
      const message = {
        records: [
          {
            recordType: 'url',
            data: encoder.encode(data.url),
          },
          {
            recordType: 'mime',
            mediaType: 'application/json',
            data: encoder.encode(jsonData),
          },
        ],
      };

      await ndef.write(message);
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        throw new Error('NFC permission denied. Please allow NFC access in your browser settings.');
      } else if (error.name === 'NotSupportedError') {
        throw new Error('NFC is not supported on this device.');
      } else if (error.name === 'NotReadableError') {
        throw new Error('NFC is already in use by another application.');
      } else {
        throw new Error(`Failed to write NFC data: ${error.message}`);
      }
    }
  }

  /**
   * Read NFC data (Android Chrome only)
   */
  static async readNFC(): Promise<NFCData> {
    if (!this.isNFCAvailable()) {
      throw new Error('NFC is not available on this device.');
    }

    try {
      const ndef = new (window as any).NDEFReader();
      
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          ndef.abort();
          reject(new Error('NFC read timeout. Please try again.'));
        }, 30000); // 30 second timeout

        ndef.scan()
          .then(() => {
            ndef.onreading = (event: any) => {
              clearTimeout(timeout);
              
              try {
                // Try to find JSON data in the message
                let nfcData: NFCData | null = null;
                
                for (const record of event.message.records) {
                  if (record.recordType === 'mime' && record.mediaType === 'application/json') {
                    const decoder = new TextDecoder();
                    const jsonString = decoder.decode(record.data);
                    nfcData = JSON.parse(jsonString);
                    break;
                  } else if (record.recordType === 'url') {
                    // Fallback: extract token from URL
                    const decoder = new TextDecoder();
                    const url = decoder.decode(record.data);
                    const tokenMatch = url.match(/\/share\/([^\/]+)/);
                    if (tokenMatch) {
                      nfcData = {
                        type: 'giftcard',
                        id: '',
                        code: '',
                        shareToken: tokenMatch[1],
                        url: url,
                      };
                    }
                  }
                }

                if (nfcData) {
                  resolve(nfcData);
                } else {
                  reject(new Error('Invalid NFC data format. Could not read gift card information.'));
                }
              } catch (error: any) {
                reject(new Error(`Failed to parse NFC data: ${error.message}`));
              }
            };

            ndef.onreadingerror = (error: any) => {
              clearTimeout(timeout);
              reject(new Error(`NFC read error: ${error.message || 'Unknown error'}`));
            };
          })
          .catch((error: any) => {
            clearTimeout(timeout);
            if (error.name === 'NotAllowedError') {
              reject(new Error('NFC permission denied. Please allow NFC access in your browser settings.'));
            } else if (error.name === 'NotSupportedError') {
              reject(new Error('NFC is not supported on this device.'));
            } else {
              reject(new Error(`Failed to start NFC reader: ${error.message}`));
            }
          });
      });
    } catch (error: any) {
      throw new Error(`NFC read failed: ${error.message}`);
    }
  }

  /**
   * Stop NFC reading
   */
  static async stopReading(): Promise<void> {
    // The NDEFReader doesn't have a direct stop method
    // The reading will stop when the page is unloaded or when abort() is called
    // This is a placeholder for future implementation if needed
  }
}

export default NFCService;

