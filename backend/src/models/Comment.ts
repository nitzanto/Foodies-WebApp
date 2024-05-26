import mongoose, { Schema, Document, Model} from 'mongoose';

export interface IComment extends Document {
    _id: Schema.Types.ObjectId;
    postId: Schema.Types.ObjectId;
    userId: Schema.Types.ObjectId;
    userName: string;
    content: string;
    createdAt: Date;
}

const CommentSchema: Schema = new Schema<IComment>({
    postId: { 
        type: Schema.Types.ObjectId, 
        required: true, 
        ref: 'Post'
    },
    userId: { 
        type: Schema.Types.ObjectId, 
        required: true, 
        ref: 'User'
    },
    userName: { 
        type: String, 
        required: true,
        ref: 'User'
    },
    content: { 
        type: String, 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
});

const CommentModel: Model<IComment> = mongoose.model<IComment>('Comment', CommentSchema);
export default CommentModel;