import { Request, Response } from "express";
export declare const createCheckoutSession: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getHistory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const handleStripeWebhook: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=BalanceController.d.ts.map