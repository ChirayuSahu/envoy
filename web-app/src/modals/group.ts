import mongoose, { Schema } from "mongoose";

const groupSchema = new Schema({
    envs: [{
        type: {
            key: {
                type: String,
                required: true,
                trim: true,
            },
            value: {
                type: String,
                required: true,
                trim: true,
            }
        },
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    workspace: {
        type: Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true,
    },
    token: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
    },
    isPublic: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

const Group = mongoose.models.Group || mongoose.model('Group', groupSchema);
export default Group;