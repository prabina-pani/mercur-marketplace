import { Text } from "@medusajs/ui";

/** Matches `PAYLOAD_KEYS` in backend `seller_registration` module */
export const SELLER_REGISTRATION_PAYLOAD_FIELDS = [
  { key: "first_name", label: "First name" },
  { key: "middle_name", label: "Middle name" },
  { key: "last_name", label: "Last name" },
  { key: "mobile_number", label: "Mobile" },
  { key: "email", label: "Email" },
  { key: "company_legal_name", label: "Company legal name" },
  { key: "company_tax_id", label: "Company tax ID" },
  { key: "company_address", label: "Company address" },
  { key: "company_website", label: "Company website" },
] as const;

function formatCell(key: string, raw: unknown) {
  const s = raw == null ? "" : String(raw).trim();
  if (!s) {
    return <Text size="small">—</Text>;
  }
  if (key === "company_website") {
    const href = s.startsWith("http://") || s.startsWith("https://") ? s : `https://${s}`;
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-ui-fg-interactive hover:underline break-all"
      >
        {s}
      </a>
    );
  }
  return (
    <Text size="small" className="whitespace-pre-wrap break-words">
      {s}
    </Text>
  );
}

type Props = {
  payload?: Record<string, unknown> | null;
  title?: string;
  className?: string;
};

export function SellerRegistrationPayloadGrid({
  payload,
  title = "Application",
  className = "",
}: Props) {
  return (
    <div className={className}>
      <Text className="text-ui-fg-subtle mb-2 text-xs font-medium uppercase">
        {title}
      </Text>
      <div className="grid gap-3 sm:grid-cols-2">
        {SELLER_REGISTRATION_PAYLOAD_FIELDS.map(({ key, label }) => (
          <div key={key}>
            <Text className="text-ui-fg-subtle mb-0.5 text-xs">{label}</Text>
            {formatCell(key, payload?.[key])}
          </div>
        ))}
      </div>
    </div>
  );
}
