import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    course: z.string().min(1, "Course is required"),
    semester: z.number().int("Semester must be an integer").min(1, "Semester must be at least 1").max(10, "Semester must be at most 10"),
    college: z.string().min(1, "College is required"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});
