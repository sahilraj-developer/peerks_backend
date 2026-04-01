import { Document } from "mongoose";
export interface IActivity extends Document {
    slug: string;
    title: string;
    description?: string;
    points: number;
    createdAt: Date;
}
declare const Activity: import("mongoose").Model<IActivity, {}, {}, {}, Document<unknown, {}, IActivity> & IActivity & {
    _id: import("mongoose").Types.ObjectId;
}, any>;
export default Activity;
//# sourceMappingURL=Activity.d.ts.map