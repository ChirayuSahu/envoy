import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        username: {
            type: String,
            unique: true,
            required: function (this: any) {
                return this.provider === "credentials";
            },
            sparse: true,
            lowercase: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            index: true,
            lowercase: true,
            trim: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Basic email regex
        },
        password: {
            type: String,
            required: function (this: any) {
                return this.provider === "credentials";
            },
            select: false,
        },
        provider: {
            type: String,
            default: "credentials",
            enum: ["credentials", "google"],
        },
        image: {
            type: String,
        },
        workspaces: [
            {
                type: Schema.Types.ObjectId,
                ref: "Workspace",
            },
        ],
        otherGroups: [
            {
                type: Schema.Types.ObjectId,
                ref: "Group",
            },
        ],
        passwordResetToken: String,
        tokenExpiry: Date,
    },
    {
        timestamps: true,
    }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
