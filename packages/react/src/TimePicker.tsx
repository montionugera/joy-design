import * as React from 'react';

export interface TimePickerProps {
  value?: string;
  defaultValue?: string;
  format?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onChange?: (time: string) => void;
}

export const TimePicker = React.forwardRef<HTMLDivElement, TimePickerProps>(
  ({
    value: controlledValue,
    defaultValue = '',
    format = 'HH:mm:ss',
    placeholder = 'Select time',
    disabled = false,
    className = '',
    onChange
  }, ref) => {
    const [internalVal, setInternalVal] = React.useState<string>(
      controlledValue !== undefined ? controlledValue : defaultValue
    );
    const [isOpen, setIsOpen] = React.useState(false);

    const currentVal = controlledValue !== undefined ? controlledValue : internalVal;
    const showSeconds = format.includes('ss');

    const split = currentVal ? currentVal.split(':') : ['00', '00', '00'];
    const parts = {
      hour: split[0] || '00',
      minute: split[1] || '00',
      second: split[2] || '00'
    };

    const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
    const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
    const seconds = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

    const selectPart = (type: 'hour' | 'minute' | 'second', val: string) => {
      const next = { ...parts, [type]: val };
      const formatted = showSeconds
        ? `${next.hour}:${next.minute}:${next.second}`
        : `${next.hour}:${next.minute}`;

      if (controlledValue === undefined) {
        setInternalVal(formatted);
      }
      onChange?.(formatted);
    };

    return (
      <div ref={ref} className={`joy-time-picker ${className}`.trim()}>
        <div
          className={`joy-input-wrapper ${disabled ? 'joy-input-wrapper--disabled' : ''}`}
          onClick={() => { if (!disabled) setIsOpen(!isOpen); }}
        >
          <input
            type="text"
            className="joy-input"
            readOnly
            disabled={disabled}
            placeholder={placeholder}
            value={currentVal}
          />
          <span style={{ paddingRight: 10, display: 'flex', alignItems: 'center', color: 'var(--joy-color-text-muted, #64748b)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </span>
        </div>

        {isOpen && (
          <div className="joy-time-picker__panel" role="dialog">
            <div className="joy-time-picker__column" aria-label="Hours">
              {hours.map((h) => (
                <div
                  key={h}
                  className={`joy-time-picker__cell ${parts.hour === h ? 'joy-time-picker__cell--selected' : ''}`}
                  onClick={() => selectPart('hour', h)}
                >
                  {h}
                </div>
              ))}
            </div>
            <div className="joy-time-picker__column" aria-label="Minutes">
              {minutes.map((m) => (
                <div
                  key={m}
                  className={`joy-time-picker__cell ${parts.minute === m ? 'joy-time-picker__cell--selected' : ''}`}
                  onClick={() => selectPart('minute', m)}
                >
                  {m}
                </div>
              ))}
            </div>
            {showSeconds && (
              <div className="joy-time-picker__column" aria-label="Seconds">
                {seconds.map((s) => (
                  <div
                    key={s}
                    className={`joy-time-picker__cell ${parts.second === s ? 'joy-time-picker__cell--selected' : ''}`}
                    onClick={() => selectPart('second', s)}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

TimePicker.displayName = 'TimePicker';
