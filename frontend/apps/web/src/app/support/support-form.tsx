"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";

export type DonationFormState = { error: string } | null;

type GivingOption = { title: string; value: string };

export function DonationForm({
  currency,
  amounts,
  givingOptions,
  action,
}: {
  currency: string;
  amounts: number[];
  givingOptions: GivingOption[];
  action: (prevState: DonationFormState, formData: FormData) => Promise<DonationFormState>;
}) {
  const [state, formAction, isPending] = useActionState(action, null);
  const presetAmounts = amounts.slice(0, 4);
  const [selectedAmount, setSelectedAmount] = useState(presetAmounts[1] ?? presetAmounts[0]);
  const [customAmount, setCustomAmount] = useState("");
  const [donationType, setDonationType] = useState("one_time");
  const [isTribute, setIsTribute] = useState(false);
  const usingCustomAmount = customAmount.trim() !== "";

  return (
    <form
      action={formAction}
      className="rounded-md border border-border bg-white p-5 shadow-sm sm:p-6"
      aria-describedby={state?.error ? "donation-form-error" : undefined}
    >
      <input type="hidden" name="currency" value={currency} />
      <input type="hidden" name="preferred_payment_method" value="inquiry" />

      <fieldset>
        <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Amount
        </legend>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {presetAmounts.map((amount) => (
            <label key={amount} className="cursor-pointer">
              <input
                type="radio"
                name="amount"
                value={amount}
                checked={!usingCustomAmount && selectedAmount === amount}
                onChange={() => {
                  setSelectedAmount(amount);
                  setCustomAmount("");
                }}
                className="peer sr-only"
              />
              <span className="flex min-h-11 items-center justify-center rounded-md border border-border bg-white px-3 text-sm font-semibold text-muted-foreground transition peer-checked:border-secondary peer-checked:bg-secondary peer-checked:text-white peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2">
                {currency} {amount.toLocaleString()}
              </span>
            </label>
          ))}
        </div>
        <label className="mt-3 block">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Or enter your own amount
          </span>
          <input
            name="custom_amount"
            type="number"
            inputMode="decimal"
            min="1"
            step="0.01"
            autoComplete="off"
            value={customAmount}
            onChange={(event) => setCustomAmount(event.target.value)}
            placeholder={`${currency} custom amount`}
            className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </label>
        <p aria-live="polite" className="mt-2 text-xs font-semibold text-muted-foreground">
          Giving {currency}{" "}
          {(usingCustomAmount ? Number(customAmount) || 0 : selectedAmount).toLocaleString()}
        </p>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Gift type
        </legend>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {[
            ["one_time", "One-time"],
            ["recurring", "Recurring"],
            ["pledge", "Pledge"],
          ].map(([value, label]) => (
            <label key={value} className="cursor-pointer">
              <input
                type="radio"
                name="donation_type"
                value={value}
                checked={donationType === value}
                onChange={() => setDonationType(value)}
                className="peer sr-only"
              />
              <span className="flex min-h-11 items-center justify-center rounded-md border border-border bg-white px-3 text-sm font-semibold text-muted-foreground transition peer-checked:border-secondary peer-checked:bg-secondary peer-checked:text-white peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2">
                {label}
              </span>
            </label>
          ))}
        </div>
        {donationType === "recurring" ? (
          <label className="mt-3 block">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              How often
            </span>
            <select
              name="recurring_frequency"
              defaultValue="monthly"
              className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </label>
        ) : null}
      </fieldset>

      <label className="mt-6 block">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Giving area
        </span>
        <select
          name="designation"
          defaultValue={givingOptions[0]?.value}
          className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {givingOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.title}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-6 border-t border-border pt-5">
        <h3 className="text-base font-semibold text-foreground">Donor details</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <InputField name="display_name" label="Name" placeholder="Your name" required />
          <InputField name="email" label="Email" placeholder="you@example.com" type="email" required />
          <InputField name="phone" label="Phone" placeholder="Phone number" type="tel" />
          <label>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Donor type
            </span>
            <select
              name="donor_type"
              defaultValue="individual"
              className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="individual">Individual</option>
              <option value="alumni">Alumni</option>
              <option value="corporate">Corporate</option>
              <option value="foundation">Foundation</option>
              <option value="partner">Partner</option>
            </select>
          </label>
        </div>
      </div>

      <details className="mt-5 rounded-md border border-border bg-surface-subtle p-4">
        <summary className="cursor-pointer text-sm font-semibold text-foreground">
          Additional details (organization, tribute, recognition)
        </summary>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <InputField name="organization_name" label="Organization" placeholder="Optional organization" />
          <label>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Recognition
            </span>
            <select
              name="recognition_public"
              defaultValue="false"
              className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="false">Keep private</option>
              <option value="true">May be recognized publicly</option>
            </select>
          </label>
          <label>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Anonymous giving
            </span>
            <select
              name="is_anonymous"
              defaultValue="false"
              className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="false">Use my name internally</option>
              <option value="true">Keep me anonymous</option>
            </select>
          </label>
          <label>
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Tribute gift
            </span>
            <select
              name="is_tribute"
              value={isTribute ? "true" : "false"}
              onChange={(event) => setIsTribute(event.target.value === "true")}
              className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="false">No tribute</option>
              <option value="true">In honor or memory</option>
            </select>
          </label>
          {isTribute ? (
            <>
              <label>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Tribute type
                </span>
                <select
                  name="tribute_type"
                  defaultValue="in_honor"
                  className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="in_honor">In honor</option>
                  <option value="in_memory">In memory</option>
                </select>
              </label>
              <InputField name="tribute_name" label="Tribute name" placeholder="Who is this gift for?" />
              <label className="sm:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Dedication
                </span>
                <textarea
                  name="dedication"
                  rows={3}
                  placeholder="Optional dedication text"
                  className="mt-2 w-full rounded-md border border-border bg-white px-3 py-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </label>
            </>
          ) : null}
          <label className="sm:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Purpose or note
            </span>
            <input
              name="purpose"
              placeholder="Optional purpose, fund, programme, or scholarship note"
              className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Message
            </span>
            <textarea
              name="message"
              rows={3}
              placeholder="Optional donor message or pledge note"
              className="mt-2 w-full rounded-md border border-border bg-white px-3 py-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </label>
        </div>
      </details>

      {state?.error ? (
        <p
          id="donation-form-error"
          role="alert"
          className="mt-5 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm font-semibold text-destructive"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md bg-secondary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? (
          <>
            <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            Submitting your gift…
          </>
        ) : (
          <>
            Submit my gift
            <ArrowRight aria-hidden className="h-4 w-4" />
          </>
        )}
      </button>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        Submitting records a pending gift with the advancement office. You will receive a reference
        code and payment details to complete the gift; no money is taken through this form.
      </p>
    </form>
  );
}

function InputField({
  name,
  label,
  placeholder,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  const autoComplete =
    name === "display_name"
      ? "name"
      : name === "email"
        ? "email"
        : name === "phone"
          ? "tel"
          : name === "organization_name"
            ? "organization"
            : "off";

  return (
    <label>
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        spellCheck={type === "email" ? false : undefined}
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-md border border-border bg-white px-3 text-sm transition focus:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
    </label>
  );
}
