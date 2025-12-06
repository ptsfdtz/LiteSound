import styles from './SelectField.module.css';

type Option = {
  label: string;
  value: string;
};

type SelectFieldProps = {
  id: string;
  label: string;
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
};

function SelectField({ id, label, options, value, onChange }: SelectFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <select id={id} name={id} value={value} onChange={(e) => onChange?.(e.target.value)}>
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectField;
