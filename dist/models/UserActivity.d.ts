import { Document, Types } from "mongoose";
export interface IUserActivity extends Document {
    userId: Types.ObjectId;
    activityId: Types.ObjectId;
    points: number;
    createdAt: Date;
}
declare const UserActivity: import("mongoose").Model<IUserActivity, {}, {}, {}, Document<unknown, {}, IUserActivity> & IUserActivity & {
    _id: Types.ObjectId;
}, any>;
export default UserActivity;
//# sourceMappingURL=UserActivity.d.ts.map