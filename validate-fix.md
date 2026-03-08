# Input Validation Implementation Plan (Zod)

This document outlines a detailed, 2-phase approach to implement comprehensive input validation in the backend using Zod, and properly showcase those validation errors in the frontend.

## Phase 1: Backend Validation (Zod)

In this phase, we will install Zod, create a reusable validation middleware, define validation schemas for all necessary resources, and apply them to the relevant `POST`, `PATCH`, and `PUT` routes.

### 1.1 Install Zod
Run the following command in the `server` directory:
```bash
cd server
npm install zod
```

### 1.2 Create Validation Middleware
Create a reusable middleware in `server/src/middleware/validate.js` to process Zod schemas:
```javascript
import { ZodError } from "zod";

export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      // Format Zod errors to be easily consumed by the frontend
      const formatErrors = error.errors.map((err) => ({
        field: err.path.join('.').replace('body.', ''), // e.g. "email"
        message: err.message,
      }));
      return res.status(400).json({
        message: "Validation Failed",
        errors: formatErrors,
      });
    }
    next(error);
  }
};
```

### 1.3 Define Validation Schemas
Create a new directory `server/src/validations` and define Zod schemas for the routes.

**Example: `server/src/validations/auth.validation.js`**
```javascript
import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});
```
*Repeat this for `groups.validation.js`, `projects.validation.js`, `users.validation.js`, etc., covering all POST/PATCH/PUT endpoints.*

### 1.4 Apply Middleware to Routes
Update the route files in `server/src/routes/` to use the validation schemas.

**Example: `server/src/routes/auth.js`**
```javascript
import express from 'express';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validations/auth.validation.js';
// ... import endpoint controllers

const router = express.Router();

router.post('/register', validate(registerSchema), registerController);
router.post('/login', validate(loginSchema), loginController);

export default router;
```
*Apply this pattern to all `POST`, `PUT`, and `PATCH` routes across the backend.*

---

## Phase 2: Frontend Error Handling

In this phase, we will map the structured validation errors returned by the backend and showcase them properly under their respective input fields in the frontend forms.

### 2.1 Update API Interceptor
Update `client/src/lib/api.js` to ensure the detailed validation errors are passed down to the components.
```javascript
// client/src/lib/api.js

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Keep the main message
    const message = error.response?.data?.message || error.message;
    // Extract the field-specific errors array
    const fieldErrors = error.response?.data?.errors || [];
    
    // Reject with an object containing both so the UI can parse it
    return Promise.reject({ message, fieldErrors });
  }
);
```

### 2.2 Form Error State Implementation
For every form component (e.g., `RegisterPage.jsx`, `LoginPage.jsx`, Modals), introduce a state to manage field-level validation errors.

**Example implementation for `RegisterPage.jsx`:**
```javascript
import { useState } from "react";
// ... other imports

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({}); // <--- New State

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({}); // Reset errors on sumbit

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
      await register({ ... });
      // ... success logic
    } catch (error) {
      if (error.fieldErrors && error.fieldErrors.length > 0) {
        // Map backend errors array to an object: { email: "Invalid email", password: "..." }
        const errorsMap = {};
        error.fieldErrors.forEach((err) => {
          errorsMap[err.field] = err.message;
        });
        setFieldErrors(errorsMap);
      } else {
        // Fallback to generic toast
        toast.error(error.message || "Failed to create account");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Example for Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          name="email" 
          type="email" 
          required 
          className={fieldErrors.email ? "border-red-500" : ""} // Highlight input
        />
        {/* Render the error message below the input */}
        {fieldErrors.email && (
          <span className="text-sm text-red-500">{fieldErrors.email}</span>
        )}
      </div>
      {/* Repeat for other fields... */}
    </form>
  )
}
```

### 2.3 Comprehensive Form Update List
To complete Phase 2, the error handling pattern above must be applied to the following client pages/components that handle `POST`, `PUT`, or `PATCH` requests:
- `client/src/pages/RegisterPage.jsx`
- `client/src/pages/LoginPage.jsx`
- `client/src/pages/ProfilePage.jsx` (Profile Edit Forms)
- `client/src/components/groups/*` (Group Creation/Edit Forms)
- `client/src/components/projects/*` (Project Submission/Edit Forms)

### 2.4 Optional Enhancement: Unified Client-side Zod Validation
To prevent unnecessary API requests, it is highly recommended to eventually install Zod and React Hook Form (`npm install zod react-hook-form @hookform/resolvers`) in the client, allowing you to use exactly the same validation schemas on the frontend for immediate UI feedback before the data reaches the backend. However, completing Phase 1 and 2 robustly will provide the necessary foundation.
