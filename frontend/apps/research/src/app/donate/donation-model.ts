import type { ResearchGenericRecord } from "@ksu/api-client";

import { institutionContact } from "../../config/institution";
import { compactText } from "../../lib/research-public-data";

const defaultAmounts = [1000, 2500, 5000, 10000];

export type DonationBankDetails = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string;
  branch: string;
  instructions: string;
};

export type DonationSettings = {
  amounts: number[];
  currency: string;
  onlineGivingUrl: string;
  contactEmail: string;
  contactHref: string;
  bank: DonationBankDetails;
};

export function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export function getDonationAmount(formData: FormData) {
  const customAmount = Number(getFormString(formData, "custom_amount"));
  if (Number.isFinite(customAmount) && customAmount > 0) return customAmount;
  const selectedAmount = Number(getFormString(formData, "amount"));
  return Number.isFinite(selectedAmount) && selectedAmount > 0 ? selectedAmount : 0;
}

export function getDonationBinding(value: string) {
  const [kind, id] = value.split(":");
  const binding = {
    designation: kind || "unrestricted",
    project_id: null as string | null,
    center_id: null as string | null,
    scholarship_id: null as string | null,
    fund_id: null as string | null,
  };
  if (!id) return binding;
  if (kind === "project") binding.project_id = id;
  if (kind === "center") binding.center_id = id;
  if (kind === "scholarship") binding.scholarship_id = id;
  if (kind === "fund") binding.fund_id = id;
  return binding;
}

export function buildDonationSettings(records: ResearchGenericRecord[]): DonationSettings {
  const settings = new Map(records.map((record) => [compactText(record.key), record]));
  const amountRecord = settings.get("suggested_amounts") || settings.get("donation_amounts") || settings.get("amounts");
  const currency = compactText(settings.get("currency")?.value) || compactText(settings.get("default_currency")?.value) || "KES";
  const onlineGivingUrl = compactText(settings.get("online_giving_url")?.value) || compactText(settings.get("payment_url")?.value) || compactText(settings.get("donation_url")?.value);
  const contactEmail = compactText(settings.get("contact_email")?.value) || compactText(settings.get("giving_email")?.value) || institutionContact.email;
  return {
    amounts: getSuggestedAmounts(amountRecord),
    currency,
    onlineGivingUrl,
    contactEmail,
    contactHref: `mailto:${contactEmail}?subject=Research%20Donation%20Inquiry`,
    bank: {
      bankName: getSettingValue(settings, ["bank_name", "donation_bank_name"]),
      accountName: getSettingValue(settings, ["account_name", "bank_account_name", "donation_account_name"]),
      accountNumber: getSettingValue(settings, ["account_number", "bank_account_number", "donation_account_number"]),
      swiftCode: getSettingValue(settings, ["swift_code", "bank_swift_code"]),
      branch: getSettingValue(settings, ["bank_branch", "branch"]),
      instructions: getSettingValue(settings, ["payment_instructions", "bank_transfer_instructions", "donation_instructions"]),
    },
  };
}

function getSettingValue(settings: Map<string, ResearchGenericRecord>, keys: string[]) {
  for (const key of keys) {
    const value = compactText(settings.get(key)?.value) || compactText(settings.get(key)?.description);
    if (value) return value;
  }
  return "";
}

function getSuggestedAmounts(record?: ResearchGenericRecord) {
  const valueJson = record?.value_json;
  if (Array.isArray(valueJson)) return valueJson.map(Number).filter((amount) => Number.isFinite(amount) && amount > 0);
  if (Array.isArray(valueJson?.amounts)) return valueJson.amounts.map(Number).filter((amount: number) => Number.isFinite(amount) && amount > 0);
  const amounts = compactText(record?.value).split(",").map((item) => Number(item.trim())).filter((amount) => Number.isFinite(amount) && amount > 0);
  return amounts.length ? amounts : defaultAmounts;
}
