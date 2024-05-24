import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChat extends Document {
    _id: Schema.Types.ObjectId;
    users: Schema.Types.ObjectId[];
    messages: Schema.Types.ObjectId[];
    openedAt: Date;
    
}

const ChatSchema: Schema = new Schema<IChat>({
    users: [{type: Schema.Types.ObjectId, 
        required: true, 
        ref: 'User'}],
    messages: [{type: Schema.Types.ObjectId, 
        required: true, 
        ref: 'Message'}],
    openedAt: {type: Date, default: Date.now},
});

const ChatModel: Model<IChat> = mongoose.model<IChat>('Chat', ChatSchema);
export default ChatModel;