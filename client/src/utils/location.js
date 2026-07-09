// Compose a human/geocoder-friendly location string from structured parts
export function formatLocation({ street, city, country } = {}) {
  return [street, city, country].filter(Boolean).join(', ');
}
