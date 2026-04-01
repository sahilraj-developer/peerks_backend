import { Document } from "mongoose";
export interface IGiftCard extends Document {
    name: string;
    provider: string;
    pointsCost: number;
    amount: number;
    isActive: boolean;
    createdAt: Date;
}
declare const GiftCard: import("mongoose").Model<IGiftCard, {}, {}, {}, Document<unknown, {}, IGiftCard> & IGiftCard & {
    _id: import("mongoose").Types.ObjectId;
}, any>;
export default GiftCard;
//# sourceMappingURL=GiftCard.d.ts.map