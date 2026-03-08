import { z } from "zod";

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    course: z.string().optional(),
    semester: z.number().int("Semester must be an integer").min(1, "Semester must be at least 1").max(10, "Semester must be at most 10").optional(),
    college: z.string().optional(),
    skills: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
    bio: z.string().optional(),
    github: z.string().url("Invalid URL").optional().or(z.literal("")),
    linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
    twitter: z.string().url("Invalid URL").optional().or(z.literal("")),
    experience: z.array(z.object({
      title: z.string(),
      company: z.string(),
      startDate: z.string(),
      endDate: z.string().optional().nullable(),
      description: z.string().optional()
    })).optional(),
    avatarUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  }),
});
