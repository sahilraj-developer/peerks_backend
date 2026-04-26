import { Document } from "mongoose";
export interface ITask extends Document {
    title: string;
    description: string;
    type: string;
    rewardCoins: number;
    campus?: string;
    latitude?: number;
    longitude?: number;
    isActive: boolean;
    createdAt: Date;
}
declare const Task: import("mongoose").Model<ITask, {}, {}, {}, Document<unknown, {}, ITask> & ITask & {
    _id: import("mongoose").Types.ObjectId;
}, any>;
export default Task;
//# sourceMappingURL=Task.d.ts.map