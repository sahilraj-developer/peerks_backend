import { Request, Response } from "express";
export declare const getGiftCards: (req: Request, res: Response) => Promise<void>;
export declare const createGiftCard: (req: Request, res: Response) => Promise<void>;
export declare const bulkGiftCards: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateGiftCard: (req: Request, res: Response) => Promise<void>;
export declare const deleteGiftCard: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=AdminGiftCardController.d.ts.map