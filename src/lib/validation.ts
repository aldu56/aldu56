import { z } from "zod";

export const SERIAL_REGEX = /^EL[MC]-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

export function normalizeSerial(input: string) {
  const raw = input.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (raw.length !== 11) return input.toUpperCase().trim();
  return `${raw.slice(0, 3)}-${raw.slice(3, 7)}-${raw.slice(7, 11)}`;
}

export function deviceTypeFromSerial(serial: string): "mirror" | "comb" | null {
  if (!SERIAL_REGEX.test(serial)) return null;
  return serial.startsWith("ELM") ? "mirror" : "comb";
}

const email = z.string().trim().toLowerCase().email("Enter a valid email address").max(254);
const password = z
  .string()
  .min(8, "At least 8 characters")
  .max(72)
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number");

export const loginSchema = z.object({ email, password: z.string().min(1, "Enter your password") });

export const signupSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your name").max(120),
    email,
    password,
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((v) => v, "Please accept the terms"),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

export const forgotSchema = z.object({ email });

export const resetSchema = z
  .object({ password, confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

export const pairDeviceSchema = z.object({
  serial: z
    .string()
    .trim()
    .transform(normalizeSerial)
    .refine((s) => SERIAL_REGEX.test(s), "Serial format: ELM-XXXX-XXXX (mirror) or ELC-XXXX-XXXX (comb)"),
  nickname: z.string().trim().max(40).optional().default(""),
});

export const renameDeviceSchema = z.object({ id: z.string().uuid(), nickname: z.string().trim().min(1).max(40) });

export const SKIN_TYPES = ["dry", "oily", "combination", "normal", "sensitive"] as const;
export const HAIR_TYPES = ["straight", "wavy", "curly", "coily"] as const;
export const CONCERNS = ["Hydration", "Acne", "Fine lines", "Dark spots", "Redness", "Pores", "Oily scalp", "Dandruff", "Hair thinning", "Dry scalp"] as const;

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your name").max(120),
  skinType: z.enum(SKIN_TYPES).or(z.literal("")),
  hairType: z.enum(HAIR_TYPES).or(z.literal("")),
  birthYear: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d{4}$/.test(v) && +v >= 1920 && +v <= new Date().getFullYear() - 13), "Enter a valid year"),
  concerns: z.array(z.enum(CONCERNS)).max(10),
  marketingOptIn: z.boolean(),
});

export const checkoutSchema = z.object({
  items: z
    .array(z.object({ slug: z.string().min(1).max(80), quantity: z.number().int().min(1).max(20) }))
    .min(1, "Your bag is empty")
    .max(30),
  shippingName: z.string().trim().min(2, "Enter the recipient name").max(120),
  shippingAddress: z.string().trim().min(5, "Enter a street address").max(200),
  shippingCity: z.string().trim().min(2, "Enter a city").max(80),
  shippingPostalCode: z.string().trim().min(3, "Enter a postal code").max(12),
  shippingCountry: z.string().trim().min(2, "Select a country").max(56),
  phone: z.string().trim().max(30).optional().default(""),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(120),
  email,
  topic: z.enum(["general", "mirror", "comb", "order", "press"]),
  message: z.string().trim().min(10, "Tell us a little more (10+ characters)").max(5000),
});

export const newsletterSchema = z.object({ email });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type CheckoutInput = z.input<typeof checkoutSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
