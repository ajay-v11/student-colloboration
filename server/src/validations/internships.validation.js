import { z } from "zod";

export const internshipSchema = z.object({
  body: z.object({
    company: z.string().min(2, "Company name must be at least 2 characters"),
    role: z.string().min(2, "Role must be at least 2 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    location: z.string().min(2, "Location must be at least 2 characters"),
    type: z.enum(["Remote", "On-site", "Hybrid"]),
    applyUrl: z.string().url("Invalid Apply URL"),
  }),
});
