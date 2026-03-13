import { useState, useEffect } from "react";

interface DateInputProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void; // YYYY-MM-DD
  className?: string;
  placeholder?: string;
}

function toDisplay(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
}

function toISO(display: string): string {
  const parts = display.split("/");
  if (parts.length !== 3 || parts[2].length !== 4) return "";
  const [d, m, y] = parts;
  if (!d || !m || !y) return "";
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

export function DateInput({
  value,
  onChange,
  className = "form-input",
  placeholder = "DD/MM/AAAA",
}: DateInputProps) {
  const [display, setDisplay] = useState(() => toDisplay(value));

  useEffect(() => {
    setDisplay(toDisplay(value));
  }, [value]);

  const handleChange = (raw: string) => {
    // Keep only digits, max 8
    const digits = raw.replace(/\D/g, "").slice(0, 8);

    // Build DD/MM/YYYY mask
    let formatted = digits;
    if (digits.length > 4) {
      formatted =
        digits.slice(0, 2) + "/" + digits.slice(2, 4) + "/" + digits.slice(4);
    } else if (digits.length > 2) {
      formatted = digits.slice(0, 2) + "/" + digits.slice(2);
    }

    setDisplay(formatted);

    if (digits.length === 8) {
      const iso = toISO(formatted);
      if (iso) onChange(iso);
    } else if (digits.length === 0) {
      onChange("");
    }
  };

  return (
    <input
      className={className}
      type="text"
      value={display}
      placeholder={placeholder}
      maxLength={10}
      onChange={(e) => handleChange(e.target.value)}
    />
  );
}
