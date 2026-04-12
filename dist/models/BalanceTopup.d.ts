import { Document, Types } from "mongoose";
export interface IBalanceTopup extends Document {
    userId: Types.ObjectId;
    amount: number;
    method: "upi" | "debit" | "credit";
    status: "pending" | "completed" | "failed";
    provider?: "stripe";
    currency?: string;
    stripeSessionId?: string;
    stripePaymentIntentId?: string;
    createdAt: Date;
}
declare const BalanceTopup: import("mongoose").Model<IBalanceTopup, {}, {}, {}, Document<unknown, {}, IBalanceTopup> & IBalanceTopup & {
    _id: Types.ObjectId;
}, any>;
export default BalanceTopup;
//# sourceMappingURL=BalanceTopup.d.ts.map