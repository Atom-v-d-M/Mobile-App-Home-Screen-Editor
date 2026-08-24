"use client";

import { useId } from "react";
import { FieldShell, errorInputClass, inputClass } from "./FieldShell";

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
}

export function TextField({ label, value, onChange, error, hint, placeholder }: TextFieldProps) {
  const id = useId();

  return (
    <FieldShell id={id} label={label} error={error} hint={hint}>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`${inputClass} ${error ? errorInputClass : ""}`}
      />
    </FieldShell>
  );
}
