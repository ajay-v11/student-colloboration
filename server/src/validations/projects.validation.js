import { z } from "zod";

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    tags: z.array(z.string()).default([]),
    githubUrl: z.string().url("Invalid GitHub URL").optional().or(z.literal("")).nullable(),
    demoUrl: z.string().url("Invalid Demo URL").optional().or(z.literal("")).nullable(),
    groupId: z.string().optional().or(z.literal("")).nullable(),
  }),
});

export const updateProjectSchema = createProjectSchema;

export const addResourceSchema = z.object({
  body: z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    url: z.string().min(1, "URL is required"),
    type: z.enum(["link", "doc", "file", "video"]),
    fileName: z.string().optional(),
    fileType: z.string().optional(),
  }).refine((data) => {
    if (data.type === "file" && data.url.startsWith("/media/")) return true;
    try { new URL(data.url); return true; } catch { return false; }
  }, { message: "Invalid URL", path: ["url"] }),
});
