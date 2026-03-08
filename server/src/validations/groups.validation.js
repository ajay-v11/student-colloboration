import { z } from "zod";

export const createGroupSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Group name must be at least 2 chars"),
    description: z.string().min(2, "Description must be at least 2 chars"),
    interests: z.array(z.string()).default([]),
  }),
});

export const createChannelSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Channel name must be at least 2 chars"),
    type: z.enum(["TEXT", "ANNOUNCEMENT"]).default("TEXT"),
  }),
});

export const sendMessageSchema = z.object({
  body: z.object({
    content: z.string().optional().default(""),
    fileUrl: z.string().optional(),
    fileName: z.string().optional(),
    fileType: z.string().optional(),
  }).refine(
    (data) => data.content.length > 0 || !!data.fileUrl,
    { message: "Message must have content or a file attachment" }
  ),
});
