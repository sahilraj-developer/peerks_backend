import { Request, Response } from "express";
export declare const getRedemptions: (req: Request, res: Response) => Promise<void>;
export declare const getActiveRedemptions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createRedemption: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=RedemptionController.d.ts.map