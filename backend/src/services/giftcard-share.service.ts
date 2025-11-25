import crypto from 'crypto';
import prisma from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import giftCardService from './giftcard.service';

export class GiftCardShareService {
  /**
   * Generate a share token for a gift card
   */
  async generateShareToken(giftCardId: string, userId: string, userEmail?: string, expiryHours: number = 24) {
    const giftCard = await giftCardService.getById(giftCardId);
    
    // Verify user owns the gift card (check if they're the recipient or merchant)
    const isMerchant = giftCard.merchantId === userId;
    const isRecipient = userEmail && giftCard.recipientEmail && 
      giftCard.recipientEmail.toLowerCase() === userEmail.toLowerCase();
    
    if (!isRecipient && !isMerchant) {
      throw new ValidationError('You do not have permission to share this gift card');
    }

    if (!giftCard.shareEnabled) {
      throw new ValidationError('Sharing is disabled for this gift card');
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + expiryHours);

    // Update gift card with share token
        await prisma.giftCard.update({
      where: { id: giftCardId },
      data: {
        shareToken: token,
        shareTokenExpiry: expiryDate,
      },
    });

    return {
      token,
      expiryDate,
      shareUrl: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/gift-cards/share/${token}`,
    };
  }

  /**
   * Validate and get gift card by share token
   */
  async getGiftCardByToken(token: string) {
    const giftCard = await prisma.giftCard.findUnique({
      where: { shareToken: token },
      include: {
        merchant: {
          select: {
            id: true,
            email: true,
            businessName: true,
            businessLogo: true,
          },
        },
        template: true,
        product: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!giftCard) {
      throw new NotFoundError('Invalid or expired share token');
    }

    // Check if token has expired
    if (giftCard.shareTokenExpiry && giftCard.shareTokenExpiry < new Date()) {
      throw new ValidationError('Share token has expired');
    }

    // Check if sharing is still enabled
    if (!giftCard.shareEnabled) {
      throw new ValidationError('Sharing has been disabled for this gift card');
    }

    return giftCard;
  }

  /**
   * Revoke share token
   */
  async revokeShareToken(giftCardId: string, userId: string, userEmail?: string) {
    const giftCard = await giftCardService.getById(giftCardId);
    
    // Verify user owns the gift card
    const isMerchant = giftCard.merchantId === userId;
    const isRecipient = userEmail && giftCard.recipientEmail && 
      giftCard.recipientEmail.toLowerCase() === userEmail.toLowerCase();
    
    if (!isRecipient && !isMerchant) {
      throw new ValidationError('You do not have permission to revoke sharing for this gift card');
    }

    await prisma.giftCard.update({
      where: { id: giftCardId },
      data: {
        shareToken: null,
        shareTokenExpiry: null,
      },
    });

    return { success: true };
  }

  /**
   * Get NFC data format for gift card
   */
  async getNFCData(giftCardId: string, userId: string, userEmail?: string) {
    const giftCard = await giftCardService.getById(giftCardId);
    
    // Verify user owns the gift card
    const isMerchant = giftCard.merchantId === userId;
    const isRecipient = userEmail && giftCard.recipientEmail && 
      giftCard.recipientEmail.toLowerCase() === userEmail.toLowerCase();
    
    if (!isRecipient && !isMerchant) {
      throw new ValidationError('You do not have permission to access NFC data for this gift card');
    }

    // Generate or get existing share token
    let token = giftCard.shareToken;
    if (!token || (giftCard.shareTokenExpiry && giftCard.shareTokenExpiry < new Date())) {
      const shareData = await this.generateShareToken(giftCardId, userId, userEmail);
      token = shareData.token;
    }

    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/gift-cards/share/${token}`;

    // NFC data format (NDEF message)
    return {
      type: 'giftcard',
      id: giftCard.id,
      code: giftCard.code,
      shareToken: token,
      url: shareUrl,
      // For Web NFC, we'll encode as JSON string
      json: JSON.stringify({
        type: 'giftcard',
        id: giftCard.id,
        code: giftCard.code,
        shareToken: token,
        url: shareUrl,
      }),
    };
  }
}

export default new GiftCardShareService();

