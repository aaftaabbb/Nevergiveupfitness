import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

const controlClass =
  "w-full border border-line bg-ink px-3 py-3 text-sm text-text placeholder:text-muted/60 focus:border-brand-red focus:outline-none";

const labelClass = "mb-1.5 block text-[11px] font-bold uppercase tracking-[0.16em] text-muted";
const errorClass = "mt-1.5 text-xs text-brand-red";

type FieldShellProps = {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
};

export function Field({ label, htmlFor, error, hint, required, children }: FieldShellProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
        {required ? <span className="ml-1 text-brand-red">*</span> : null}
      </label>
      {children}
      {hint && !error ? <p className="mt-1.5 text-xs text-muted">{hint}</p> : null}
      {error ? <p className={errorClass}>{error}</p> : null}
    </div>
  );
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function TextInput({ label, error, hint, id, required, ...props }: TextInputProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <Field label={label} htmlFor={inputId} error={error} hint={hint} required={required}>
      <input
        id={inputId}
        className={`${controlClass} ${error ? "border-brand-red" : ""}`}
        aria-invalid={Boolean(error)}
        required={required}
        {...props}
      />
    </Field>
  );
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function TextArea({ label, error, hint, id, required, rows = 4, ...props }: TextAreaProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <Field label={label} htmlFor={inputId} error={error} hint={hint} required={required}>
      <textarea
        id={inputId}
        rows={rows}
        className={`${controlClass} resize-y ${error ? "border-brand-red" : ""}`}
        aria-invalid={Boolean(error)}
        required={required}
        {...props}
      />
    </Field>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
};

export function Select({
  label,
  error,
  hint,
  options,
  placeholder,
  id,
  required,
  ...props
}: SelectProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <Field label={label} htmlFor={inputId} error={error} hint={hint} required={required}>
      <select
        id={inputId}
        className={`${controlClass} ${error ? "border-brand-red" : ""}`}
        aria-invalid={Boolean(error)}
        required={required}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}
