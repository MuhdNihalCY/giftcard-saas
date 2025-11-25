/**
 * Device Service
 * Handles device information parsing and device name generation
 */

import { UAParser } from 'ua-parser-js';
import logger from '../utils/logger';

export interface DeviceInfo {
  deviceName: string;
  deviceType: 'MOBILE' | 'DESKTOP' | 'TABLET' | 'UNKNOWN';
  userAgent: string;
  browser?: string;
  os?: string;
}

export class DeviceService {
  /**
   * Parse user agent and extract device information
   */
  parseUserAgent(userAgent: string): DeviceInfo {
    try {
      const parser = new UAParser(userAgent);
      const result = parser.getResult();

      const browser = result.browser.name || 'Unknown Browser';
      const os = result.os.name || 'Unknown OS';
      const deviceType = this.determineDeviceType(result);

      const deviceName = this.generateDeviceName(browser, os, result.device, userAgent);

      return {
        deviceName,
        deviceType,
        userAgent,
        browser,
        os,
      };
    } catch (error) {
      logger.error('Failed to parse user agent', { error, userAgent });
      return {
        deviceName: 'Unknown Device',
        deviceType: 'UNKNOWN',
        userAgent,
      };
    }
  }

  /**
   * Determine device type from parsed user agent
   */
  private determineDeviceType(result: UAParser.IResult): 'MOBILE' | 'DESKTOP' | 'TABLET' | 'UNKNOWN' {
    if (result.device.type === 'mobile') {
      return 'MOBILE';
    }
    if (result.device.type === 'tablet') {
      return 'TABLET';
    }
    if (result.device.type === undefined) {
      // Assume desktop if no device type is specified
      return 'DESKTOP';
    }
    return 'UNKNOWN';
  }

  /**
   * Generate a friendly device name
   */
  generateDeviceName(
    browser: string,
    os: string,
    device: UAParser.IDevice | undefined,
    userAgent: string,
    _ipAddress?: string
  ): string {
    const parts: string[] = [];

    // Add device model if available
    if (device?.model) {
      parts.push(device.model);
    } else if (device?.vendor) {
      parts.push(device.vendor);
    }

    // Add OS
    if (os && os !== 'Unknown OS') {
      parts.push(os);
    }

    // Add browser
    if (browser && browser !== 'Unknown Browser') {
      parts.push(browser);
    }

    // Fallback to a generic name if we couldn't parse anything useful
    if (parts.length === 0) {
      // Try to extract something from user agent
      if (userAgent.includes('Mobile')) {
        parts.push('Mobile Device');
      } else {
        parts.push('Desktop');
      }
    }

    return parts.join(' - ') || 'Unknown Device';
  }

  /**
   * Get client IP address from request
   */
  getClientIP(req: { headers: Record<string, string | string[] | undefined>; socket?: { remoteAddress?: string } }): string | undefined {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      if (typeof forwardedFor === 'string') {
        return forwardedFor.split(',')[0]?.trim();
      }
      if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
        return forwardedFor[0].split(',')[0]?.trim();
      }
    }

    const realIP = req.headers['x-real-ip'];
    if (realIP) {
      return typeof realIP === 'string' ? realIP : realIP[0];
    }

    return req.socket?.remoteAddress;
  }
}

export default new DeviceService();

