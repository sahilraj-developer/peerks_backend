import { Request, Response } from "express";
export declare const getActivities: (req: Request, res: Response) => Promise<void>;
export declare const completeActivity: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getActivityHistory: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=ActivityController.d.ts.map