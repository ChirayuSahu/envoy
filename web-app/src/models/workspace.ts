import mongoose, { Schema } from "mongoose";

const workspaceSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    groups: [{
        type: Schema.Types.ObjectId,
        ref: 'Group',
    }],
    uuid: {
        type: String,
        required: true,
        unique: true,
    },
}, {
    timestamps: true,
});

const Workspace = mongoose.models.Workspace || mongoose.model('Workspace', workspaceSchema);

export default Workspace;