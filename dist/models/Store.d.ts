import { Document } from "mongoose";
export interface IStore extends Document {
    name: string;
    description?: string;
    latitude: number;
    longitude: number;
    address?: string;
    imageUrl?: string;
    createdAt: Date;
}
declare const Store: import("mongoose").Model<IStore, {}, {}, {}, Document<unknown, {}, IStore> & IStore & {
    _id: import("mongoose").Types.ObjectId;
}, any>;
export default Store;
//# sourceMappingURL=Store.d.ts.map