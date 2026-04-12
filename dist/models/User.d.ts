import { Document } from "mongoose";
export interface IUser extends Document {
    name?: string;
    email: string;
    password: string;
    role: "user" | "admin" | "vendor";
    college?: string;
    pointBalance: number;
    createdAt: Date;
}
declare const User: import("mongoose").Model<IUser, {}, {}, {}, Document<unknown, {}, IUser> & IUser & {
    _id: import("mongoose").Types.ObjectId;
}, any>;
export default User;
//# sourceMappingURL=User.d.ts.map