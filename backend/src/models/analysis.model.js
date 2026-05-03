import mongoose from "mongoose";

const confidenceBreakdownSchema = new mongoose.Schema(
  {
    sourceReliability: { type: Number, min: 0, max: 100 },
    agreement: { type: Number, min: 0, max: 100 },
    coverage: { type: Number, min: 0, max: 100 },
  },
  { _id: false },
);

const analysisSourceSchema = new mongoose.Schema(
  {
    title: String,
    url: String,
    reliabilityScore: { type: Number, min: 0, max: 100 },
  },
  { _id: false },
);

const analysisClaimSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    text: String,
    verdict: { type: String, enum: ["true", "misleading", "false"] },
    explanation: String,
    confidence: { type: Number, min: 0, max: 100 },
    confidenceBreakdown: confidenceBreakdownSchema,
    sources: [analysisSourceSchema],
  },
  { _id: false },
);

const analysisSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    input: { type: String, required: true },
    inputType: { type: String, enum: ["text", "url"], required: true },
    claims: [analysisClaimSchema],
    overallScore: { type: Number, min: 0, max: 100 },
    summary: { type: String, default: "" },
    share: {
      isPublic: { type: Boolean, default: false },
      shareId: { type: String },
    },
  },
  { timestamps: true },
);

analysisSchema.index({ userId: 1, createdAt: -1 });
analysisSchema.index({ "share.shareId": 1 }, { unique: true, sparse: true });

export const AnalysisModel = mongoose.models.Analysis || mongoose.model("Analysis", analysisSchema);
