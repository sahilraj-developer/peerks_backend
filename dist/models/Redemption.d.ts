import { Document, Types } from "mongoose";
export interface IRedemption extends Document {
    userId: Types.ObjectId;
    giftCardId: Types.ObjectId;
    points: number;
    status: "pending" | "completed" | "cancelled";
    createdAt: Date;
}
declare const Redemption: import("mongoose").Model<IRedemption, {}, {}, {}, Document<unknown, {}, IRedemption> & IRedemption & {
    _id: Types.ObjectId;
}, any>;
export default Redemption;
//# sourceMappingURL=Redemption.d.ts.map