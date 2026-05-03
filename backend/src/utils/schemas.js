import { z } from "zod";
import { MAX_CLAIMS } from "./constants.js";

export const extractClaimsOutput = z.object({
  claims: z.array(z.object({ text: z.string().min(1) })).max(MAX_CLAIMS),
});

export const generateQueriesOutput = z.object({
  perClaim: z
    .array(
      z.object({
        claimId: z.string(),
        queries: z.array(z.string().min(1)).min(1).max(4),
      }),
    )
    .max(MAX_CLAIMS),
});

export const verifyClaimsOutput = z.object({
  results: z.array(
    z.object({
      claimId: z.string(),
      verdict: z.enum(["true", "misleading", "false"]),
      explanation: z.string(),
      citedUrls: z.array(z.string()).default([]),
    }),
  ),
});

export const generateReportOutput = z.object({
  summary: z.string(),
  overallScore: z.number().min(0).max(100),
});
