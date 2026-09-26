/**
 * payment-providers.ts
 * Centralized registry of supported e-wallets, Indonesian banks,
 * and demo test accounts for Clipstream wallet & off-ramp components.
 */

export interface PaymentProvider {
  id: string;
  name: string;
  color: string;
  bg: string;
  borderColor?: string;
  category: "EWALLET" | "BANK";
}

export interface TestAccountPreset {
  label: string;
  method: "EWALLET" | "BANK";
  provider: string;
  accountNumber: string;
  accountName: string;
  amount: string;
}

export const EWALLET_PROVIDERS: PaymentProvider[] = [
  { id: "DANA", name: "DANA", color: "#118eea", bg: "#eef7fe", borderColor: "#118eea", category: "EWALLET" },
  { id: "GOPAY", name: "GoPay", color: "#00aed6", bg: "#e6f8fc", borderColor: "#00aed6", category: "EWALLET" },
  { id: "OVO", name: "OVO", color: "#4c2a86", bg: "#f3effa", borderColor: "#4c2a86", category: "EWALLET" },
  { id: "SHOPEEPAY", name: "ShopeePay", color: "#ee4d2d", bg: "#feeeea", borderColor: "#ee4d2d", category: "EWALLET" },
];

export const BANK_PROVIDERS: PaymentProvider[] = [
  { id: "BCA", name: "Bank BCA", color: "#005baa", bg: "#e6eff7", borderColor: "#005baa", category: "BANK" },
  { id: "MANDIRI", name: "Bank Mandiri", color: "#003d79", bg: "#e6ecf2", borderColor: "#003d79", category: "BANK" },
  { id: "BRI", name: "Bank BRI", color: "#00529c", bg: "#e6eef5", borderColor: "#00529c", category: "BANK" },
  { id: "BNI", name: "Bank BNI", color: "#f15a24", bg: "#feefe9", borderColor: "#f15a24", category: "BANK" },
];

export const HACKATHON_DEMO_PRESETS: TestAccountPreset[] = [
  {
    label: "Akun Uji DANA",
    method: "EWALLET",
    provider: "DANA",
    accountNumber: "0812-9876-5432",
    accountName: "Budi Santoso (Tester)",
    amount: "10.00",
  },
  {
    label: "Akun Uji GoPay",
    method: "EWALLET",
    provider: "GOPAY",
    accountNumber: "0857-1122-3344",
    accountName: "Siti Rahma (Tester)",
    amount: "25.00",
  },
  {
    label: "Akun Uji BCA",
    method: "BANK",
    provider: "BCA",
    accountNumber: "8870123456",
    accountName: "Ahmad Clipper (Tester)",
    amount: "50.00",
  },
];
