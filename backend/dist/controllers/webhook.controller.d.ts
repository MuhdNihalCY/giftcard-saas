import { Request, Response, NextFunction } from 'express';
export declare class WebhookController {
    stripeWebhook(req: Request, res: Response, next: NextFunction): Promise<void>;
    private handleStripePaymentSuccess;
    private handleStripePaymentFailed;
    private handleStripeRefund;
    razorpayWebhook(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
    private handleRazorpayPaymentSuccess;
    private handleRazorpayPaymentFailed;
}
declare const _default: WebhookController;
export default _default;
//# sourceMappingURL=webhook.controller.d.ts.map