import mongoose, { Schema } from "mongoose";

const organizationSchema = new Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 64 },
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        migratedFrom: { type: String, index: true, sparse: true },
    },
    { timestamps: true }
);

const Organization = mongoose.models.Organization || mongoose.model("Organization", organizationSchema);
export default Organization;
