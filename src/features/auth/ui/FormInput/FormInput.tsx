import React from 'react';
import './FormInput.css';

interface Props {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  icon: string;
  errors?: string[];
  autoComplete?: string;
  onChange: (value: string) => void;
  rightElement?: React.ReactNode;
}

export function FormInput({ id, label, type = 'text', placeholder, value, icon, errors, autoComplete, onChange, rightElement }: Props) {
  return (
    <div className="fi-field">
      <label htmlFor={id} className="fi-label">{label}</label>
      <div className="fi-input-wrap">
        <i className={`pi ${icon} fi-input-icon`} />
        <input id={id} type={type} className="fi-input" placeholder={placeholder} value={value} autoComplete={autoComplete} onChange={e => onChange(e.target.value)} />
        {rightElement}
      </div>
      {errors?.map((msg, i) => <small key={i} className="fi-error">{msg}</small>)}
    </div>
  );
}
