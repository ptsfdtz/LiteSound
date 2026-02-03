import { useMemo, type ReactNode } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { cn } from '@/lib/utils';

type DropdownProps<T> = {
  value?: T;
  onChange: (value: T) => void;
  options: T[];
  getOptionLabel: (option: T) => string;
  buttonLabel: string;
  selectedLabel?: string;
  getOptionMeta?: (option: T) => ReactNode;
  getOptionKey?: (option: T) => string;
  className?: string;
};

export function Dropdown<T>(props: DropdownProps<T>) {
  const {
    value,
    onChange,
    options,
    getOptionLabel,
    buttonLabel,
    selectedLabel,
    getOptionMeta,
    getOptionKey,
    className,
  } = props;

  const resolveKey = (option: T) => (getOptionKey ? getOptionKey(option) : getOptionLabel(option));
  const selectedKey = value ? resolveKey(value) : undefined;
  const optionMap = useMemo(
    () => new Map(options.map((option) => [resolveKey(option), option])),
    [options, getOptionKey, getOptionLabel],
  );

  const handleChange = (next: string) => {
    const selected = optionMap.get(next);
    if (selected) {
      onChange(selected);
    }
  };

  return (
    <Select value={selectedKey} onValueChange={handleChange}>
      <SelectTrigger className={cn('min-w-[220px] justify-between', className)}>
        <span className="truncate text-left">{buttonLabel}</span>
      </SelectTrigger>
      <SelectContent align="start">
        {options.map((option) => {
          const key = resolveKey(option);
          const meta = getOptionMeta ? getOptionMeta(option) : undefined;
          const isSelected = selectedKey === key;
          return (
            <SelectItem key={key} value={key}>
              <span className="flex w-full items-center justify-between gap-2">
                <span className="truncate">{getOptionLabel(option)}</span>
                {isSelected && selectedLabel ? (
                  <span className="text-xs text-muted-foreground">{selectedLabel}</span>
                ) : meta != undefined ? (
                  <span className="text-xs text-muted-foreground">{meta}</span>
                ) : null}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
