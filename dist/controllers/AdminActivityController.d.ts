import { Request, Response } from "express";
export declare const getActivities: (req: Request, res: Response) => Promise<void>;
export declare const createActivity: (req: Request, res: Response) => Promise<void>;
export declare const bulkActivities: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateActivity: (req: Request, res: Response) => Promise<void>;
export declare const deleteActivity: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=AdminActivityController.d.ts.map