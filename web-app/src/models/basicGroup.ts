import mongoose, { Schema } from "mongoose";

const basicGroupSchema = new Schema({
    token: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
    },
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
    expireAt: {
        type: Date,
        required: true,
    },

}, { timestamps: true });

basicGroupSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const BasicGroup = mongoose.models.BasicGroup || mongoose.model('BasicGroup', basicGroupSchema);
export default BasicGroup;