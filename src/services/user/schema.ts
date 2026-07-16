import * as z from "zod";

export const PASSWORD_REGEX =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-.]).{8,}$/;

export const loginFormSchema = z.object({
  email: z
    .string({
      invalid_type_error: "Please provide a valid email address",
      required_error: "Please provide a valid email address",
    })
    .email({
      message: "Please provide a valid email address",
    }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

export const registerFormSchema = z.object({
  username: z.string().min(5, {
    message: "Username should have at least 5 characters",
  }),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  mobileNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long"),
  password: z
    .string()
    .min(8, {
      message: "Password should have at least 8 characters",
    })
    .refine(
      (value: string) => PASSWORD_REGEX.test(value),
      "Password should have 8 characters, have at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});

export const forgotPasswordFormSchema = z.object({
  phone: z.string(),
});

export const forgotPasswordEmailFormSchema = z.object({
  email: z
    .string({
      invalid_type_error: "Please provide a valid email address",
      required_error: "Please provide a valid email address",
    })
    .email({
      message: "Please provide a valid email address",
    }),
});

export const resetPasswordWithOtpSchema = z
  .object({
    email: z
      .string({
        invalid_type_error: "Please provide a valid email address",
        required_error: "Please provide a valid email address",
      })
      .email({
        message: "Please provide a valid email address",
      }),
    otpCode: z
      .string()
      .min(6, {
        message: "OTP code must be exactly 6 digits",
      })
      .max(6, {
        message: "OTP code must be exactly 6 digits",
      })
      .regex(/^\d{6}$/, {
        message: "OTP code must be exactly 6 digits",
      }),
    newPassword: z
      .string()
      .min(8, {
        message: "Password should have at least 8 characters",
      })
      .refine(
        (value: string) => PASSWORD_REGEX.test(value),
        "Password should have 8 characters, have at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z.string().min(8, {
      message: "Password confirmation should have at least 8 characters",
    }),
  })
  .refine(
    (values: { newPassword: string; confirmPassword: string }) =>
      values.newPassword === values.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

export const verifyCodeFormSchema = z.object({
  code: z
    .string()
    .min(6, {
      message: "Code cannot be less than 6 digits",
    })
    .max(6, {
      message: "Code cannot be more than 6 digits",
    }),
});

export const resetPasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(8, {
        message: "Password should have at least 8 characters",
      })
      .refine(
        (value: string) => PASSWORD_REGEX.test(value),
        "Password should have 8 characters, have at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z.string().min(8, {
      message: "Password confirmation should have at least 8 characters",
    }),
  })
  .refine(
    (values: { password: string; confirmPassword: string }) =>
      values.password === values.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

export const profileUpdateSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  mobileNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number is too long"),
});

export const addBankAccountSchema = z.object({
  account_number: z
    .string()
    .min(10, "Account number cannot be less than 10 digits")
    .max(10, "Account number cannot be more than 10 digits"),
  bank_name: z.string().min(1, "Select your bank bank name from the list"),
  bank_code: z.string(),
  account_name: z
    .string()
    .min(1, "Please provide your full name. Name must match with bank name"),
});

export const bankAccountDefaultValues = {
  bankAccountNumber: "",
  bankName: "",
  fullName: "",
  accountType: "",
};

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(8, {
      message: "Please provide your current password",
    }),
    newPassword: z
      .string()
      .min(8, {
        message: "New password should have at least 8 characters",
      })
      .refine(
        (value: string) => PASSWORD_REGEX.test(value),
        "Password should have 8 characters, have at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmNewPassword: z.string().min(8, {
      message: "Please enter your new password here to confirm",
    }),
  })
  .refine(
    (values: { newPassword: string; confirmNewPassword: string }) =>
      values.newPassword === values.confirmNewPassword,
    {
      message: "New password do not match",
      path: ["confirmNewPassword"],
    }
  );

export const loginFormDefaultValues = {
  loginType: "EMAIL" as "EMAIL" | "PHONE",
  emailOrUsername: "",
  mobileNumber: "",
  password: "",
};

export const registerFormDefaultValues = {
  username: "",
  email: "",
  mobileNumber: "",
  password: "",
};

export const confirmNewUserAccount = z.object({
  otp: z
    .string()
    .min(5, {
      message: "Code cannot be less than 5 digits",
    })
    .max(5, {
      message: "Code cannot be more than 5 digits",
    }),
});

export const verifyResetPasswordSchema = z.object({
  otp: z
    .string()
    .min(5, {
      message: "Code cannot be less than 5 digits",
    })
    .max(5, {
      message: "Code cannot be more than 5 digits",
    }),
  password: z
    .string()
    .min(8, {
      message: "Password should have at least 8 characters",
    })
    .refine(
      (value: string) => PASSWORD_REGEX.test(value),
      "Password should have 8 characters, have at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
});


export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
export type ForgotPasswordEmailFormValues = z.infer<typeof forgotPasswordEmailFormSchema>;
export type ResetPasswordWithOtpFormValues = z.infer<typeof resetPasswordWithOtpSchema>;
export type VerifyCodeFormValues = z.infer<typeof verifyCodeFormSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;
