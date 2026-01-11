import { z } from "zod";

export const passwordRules = {
  minLength: 8,
  upper: /[A-Z]/,
  lower: /[a-z]/,
  number: /[0-9]/,
  special: /[!@#$%^&*]/,
};

const passwordFieldsSchema = z.object({
  password: z
    .string()
    .min(
      passwordRules.minLength,
      `Must be at least ${passwordRules.minLength} characters`,
    )
    .regex(passwordRules.upper, "Must contain at least one uppercase letter")
    .regex(passwordRules.lower, "Must contain at least one lowercase letter")
    .regex(passwordRules.number, "Must contain at least one number")
    .regex(
      passwordRules.special,
      "Must contain at least one special character (!@#$%^&*)",
    ),
  confirmPassword: z.string(),
});

export const passwordSchema = passwordFieldsSchema.superRefine(
  (values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  },
);

export type PasswordValues = z.infer<typeof passwordSchema>;
export { passwordFieldsSchema };
