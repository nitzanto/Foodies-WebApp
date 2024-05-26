import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
    _id: Schema.Types.ObjectId;
    senderId: Schema.Types.ObjectId;
    receiverId: Schema.Types.ObjectId;
    content: string;
    createdAt: Date;
}

const MessageSchema: Schema = new Schema<IMessage>({
    senderId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    receiverId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    content: { type: String, required: true , trim: true }, 
    createdAt: { type: Date, default: Date.now },
});

const MessageModel: Model<IMessage> = mongoose.model<IMessage>('Message', MessageSchema);
export default MessageModel;