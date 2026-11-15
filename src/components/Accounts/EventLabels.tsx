import EventSelect from './EventSelect';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconCheck, IconDots, IconTag, IconX } from '@tabler/icons-react';
import type { AccountsPageEvent } from './AccountsPage';
import { saveAccountEventLabels } from '../../backend/events';

const palette = {
  blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  green: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  purple:
    'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  pink: 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  amber: 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  gray: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};
type PresetColor = keyof typeof palette;
export type LabelColor = PresetColor | `#${string}`;
export type LabelColors = Record<string, LabelColor>;
const swatches: Record<PresetColor, string> = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  pink: 'bg-pink-500',
  amber: 'bg-amber-500',
  gray: 'bg-gray-500',
};
function colorFor(colors: LabelColors | undefined, label: string): LabelColor {
  const color = colors?.[label];
  return color &&
    (isCustomColor(color) ||
      Object.prototype.hasOwnProperty.call(palette, color))
    ? color
    : 'blue';
}

function isCustomColor(color: string): color is `#${string}` {
  return /^#[0-9a-f]{6}$/i.test(color);
}
function badgeClass(color: LabelColor) {
  return isCustomColor(color) ? '' : palette[color as PresetColor];
}
function badgeStyle(color: LabelColor) {
  if (!isCustomColor(color)) return undefined;
  const rgb = [1, 3, 5]
    .map((index) => parseInt(color.slice(index, index + 2), 16) / 255)
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    );
  const luminance = rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
  return {
    backgroundColor: color,
    color: luminance > 0.179 ? '#000000' : '#ffffff',
  };
}
function CustomColor({
  value,
  disabled,
  onSave,
  label,
}: {
  value: LabelColor;
  disabled: boolean;
  onSave: (color: LabelColor) => void;
  label: string;
}) {
  const [draft, setDraft] = useState(isCustomColor(value) ? value : '#5191f2');
  useEffect(() => {
    if (isCustomColor(value)) setDraft(value);
  }, [value]);
  return (
    <div className="flex items-center gap-2 text-xs">
      <label className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        Custom
        <input
          type="color"
          aria-label={`Custom color for ${label}`}
          value={draft}
          disabled={disabled}
          onChange={(e) =>
            setDraft(e.target.value as `#${string}`)
          }
          className="h-7 w-8 cursor-pointer rounded border border-gray-200 dark:border-gray-600 bg-transparent p-0.5"
        />
      </label>
      <span className="font-mono text-gray-500 dark:text-gray-400">
        {draft.toUpperCase()}
      </span>
      <button
        type="button"
        disabled={disabled || draft === value}
        onClick={() => onSave(draft)}
        className="ml-auto text-primary disabled:opacity-40"
      >
        Apply
      </button>
    </div>
  );
}

export function LabelBadges({ event }: { event: AccountsPageEvent }) {
  if (!event.labels.length) return null;
  return (
    <span className="flex flex-wrap gap-1.5 mt-1">
      {event.labels.map((label) => (
        <span
          key={label}
          style={badgeStyle(colorFor(event.labelColors, label))}
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium max-w-full ${badgeClass(colorFor(event.labelColors, label))}`}
        >
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${isCustomColor(colorFor(event.labelColors, label)) ? 'bg-current' : swatches[colorFor(event.labelColors, label) as PresetColor]}`}
          />
          <span className="truncate">{label}</span>
        </span>
      ))}
    </span>
  );
}

export default function EventLabels({
  event,
  onSave,
}: {
  event: AccountsPageEvent;
  onSave: (labels: string[], colors: LabelColors) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [color, setColor] = useState<LabelColor>('blue');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (open) dialog.current?.showModal();
  }, [open]);
  function close() {
    if (saving) return;
    dialog.current?.close();
    setOpen(false);
    trigger.current?.focus();
  }
  async function save(labels: string[], colors: LabelColors) {
    setSaving(true);
    setError('');
    try {
      await saveAccountEventLabels(event.id, labels, colors);
      onSave(labels, colors);
      setDraft('');
    } catch {
      setError('Could not save labels. Please try again.');
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => {
          setOpen(true);
          setError('');
        }}
        aria-label={`Manage labels for ${event.name}`}
        title="Manage labels"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="p-1.5 rounded-md text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 flex-shrink-0"
      >
        <IconDots className="w-5 h-5" />
      </button>
      {open &&
        createPortal(
          <dialog
            ref={dialog}
            aria-labelledby={titleId}
            onCancel={(e) => {
              e.preventDefault();
              close();
            }}
            onClick={(e) => {
              if (e.target === dialog.current) {
                const box = dialog.current.getBoundingClientRect();
                if (
                  e.clientX < box.left ||
                  e.clientX > box.right ||
                  e.clientY < box.top ||
                  e.clientY > box.bottom
                )
                  close();
              }
            }}
            className="w-[calc(100%-2rem)] max-w-sm max-h-[85vh] overflow-y-auto rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-5 shadow-2xl backdrop:bg-black/40"
          >
            <div className="flex items-center justify-between gap-3 mb-1">
              <h3
                id={titleId}
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <IconTag className="w-5 h-5 text-primary" /> Event labels
              </h3>
              <button
                type="button"
                disabled={saving}
                onClick={close}
                aria-label="Close labels"
                className="p-1 rounded-md text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <IconX className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-5">
              {event.name}
            </p>
            {event.labels.length > 0 && (
              <div className="space-y-3 mb-5">
                {event.labels.map((label) => (
                  <div key={label} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span
                        style={badgeStyle(colorFor(event.labelColors, label))}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium truncate flex-1 ${badgeClass(colorFor(event.labelColors, label))}`}
                      >
                        {label}
                      </span>
                      <EventSelect
                        aria-label={`Color for ${label}`}
                        disabled={saving}
                        value={colorFor(event.labelColors, label)}
                        onChange={(e) =>
                          save(event.labels, {
                            ...event.labelColors,
                            [label]: e.target.value as LabelColor,
                          })
                        }
                      >
                        {isCustomColor(colorFor(event.labelColors, label)) && (
                          <option value={colorFor(event.labelColors, label)}>
                            Custom
                          </option>
                        )}
                        {Object.keys(palette).map((value) => (
                          <option key={value} value={value}>
                            {value[0].toUpperCase() + value.slice(1)}
                          </option>
                        ))}
                      </EventSelect>
                      <button
                        type="button"
                        aria-label={`Remove label ${label}`}
                        disabled={saving}
                        onClick={() =>
                          save(
                            event.labels.filter((value) => value !== label),
                            event.labelColors || {}
                          )
                        }
                        className="p-1 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <IconX className="w-4 h-4" />
                      </button>
                    </div>
                    <CustomColor
                      label={label}
                      value={colorFor(event.labelColors, label)}
                      disabled={saving}
                      onSave={(color) =>
                        save(event.labels, {
                          ...event.labelColors,
                          [label]: color,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            )}
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const label = draft.trim();
                if (!label || saving) return;
                if (
                  event.labels.some(
                    (value) => value.toLowerCase() === label.toLowerCase()
                  )
                ) {
                  setError('This event already has that label.');
                  return;
                }
                save([...event.labels, label], {
                  ...event.labelColors,
                  [label]: color,
                });
              }}
            >
              <label className="block text-sm font-medium">
                New label
                <input
                  autoFocus
                  aria-label="Label name"
                  placeholder="e.g. Work, Friends, Classes"
                  maxLength={40}
                  value={draft}
                  disabled={saving}
                  onChange={(e) => setDraft(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm font-normal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </label>
              <fieldset disabled={saving}>
                <legend className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Label color
                </legend>
                <div className="flex gap-2">
                  {(Object.keys(palette) as PresetColor[]).map((value) => (
                    <button
                      type="button"
                      key={value}
                      aria-label={value}
                      aria-pressed={color === value}
                      onClick={() => setColor(value)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-white ${swatches[value]} ${color === value ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800' : ''}`}
                    >
                      {color === value && <IconCheck className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
                <label className="flex items-center gap-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
                  Custom color
                  <input
                    type="color"
                    aria-label="Custom color for new label"
                    value={isCustomColor(color) ? color : '#5191f2'}
                    onChange={(e) => setColor(e.target.value as LabelColor)}
                    className="h-7 w-8 cursor-pointer rounded border border-gray-200 dark:border-gray-600 bg-transparent p-0.5"
                  />
                  {isCustomColor(color) && (
                    <span
                      className="rounded-full px-2 py-1"
                      style={badgeStyle(color)}
                    >
                      {draft.trim() || color.toUpperCase()}
                    </span>
                  )}
                </label>
              </fieldset>
              {error && (
                <p
                  role="alert"
                  className="text-sm text-red-600 dark:text-red-400"
                >
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={saving || !draft.trim()}
                className="w-full bg-primary hover:bg-blue-400 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Add label'}
              </button>
            </form>
          </dialog>,
          document.body
        )}
    </>
  );
}
