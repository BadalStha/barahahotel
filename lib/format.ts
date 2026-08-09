export const formatNPR = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "NPR",
  maximumFractionDigits: 0,
}).format;
