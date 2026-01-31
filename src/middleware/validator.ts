export interface LeadData {
  name: string;
  phone: string;
  service: string;
  address?: string;
  city?: string;
  message?: string;
}

const normalizeString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const extractCityFromAddress = (address?: string) => {
  if (!address) return "Unknown";
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : "Unknown";
};

export const validateLead = (data: unknown): LeadData => {
  if (!data || typeof data !== "object") {
    throw new Error("Invalid payload");
  }

  const payload = data as Record<string, unknown>;
  const name = normalizeString(payload.name);
  const phone = normalizeString(payload.phone);
  const service = normalizeString(payload.service);
  const address = normalizeString(payload.address);
  const cityInput = normalizeString(payload.city);
  const message = normalizeString(payload.message);

  if (!name) throw new Error("Missing required field: name");
  if (!phone) throw new Error("Missing required field: phone");
  if (!service) throw new Error("Missing required field: service");

  return {
    name,
    phone,
    service,
    address: address || undefined,
    city: cityInput || extractCityFromAddress(address),
    message: message || undefined,
  };
};
