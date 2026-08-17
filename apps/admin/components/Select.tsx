'use client';

import * as RadixSelect from '@radix-ui/react-select';
import { useId } from 'react';

/**
 * Accessible select built on Radix.
 *
 * The native `<select>` cannot be styled consistently across browsers — on
 * macOS the popup is drawn by the OS and ignores our design entirely. Radix
 * renders a real listbox we control, while keeping keyboard navigation, type-
 * ahead, focus trapping and ARIA wiring correct.
 *
 * A hidden native input carries the value so this still works inside a plain
 * server-action `<form>`, with no client state plumbing.
 */

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface SelectProps {
  name: string;
  defaultValue?: string;
  options: SelectOption[];
  placeholder?: string;
  id?: string;
  required?: boolean;
  'aria-label'?: string;
}

export function Select({
  name,
  defaultValue,
  options,
  placeholder = '선택하세요',
  id,
  required,
  ...rest
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    // `key={defaultValue}` forces a remount whenever the server-fetched value
    // changes (e.g. after a server-action save without a redirect) — an
    // uncontrolled Radix Root otherwise keeps showing the value it mounted
    // with, ignoring later `defaultValue` prop updates.
    <RadixSelect.Root key={defaultValue} name={name} defaultValue={defaultValue} required={required}>
      <RadixSelect.Trigger
        id={selectId}
        aria-label={rest['aria-label']}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-left text-sm text-[var(--color-ink)] outline-none transition-colors hover:border-[var(--color-border-strong)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] data-[placeholder]:text-[var(--color-ink-faint)]"
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon className="text-[var(--color-ink-faint)]">
          <ChevronDown />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          position="popper"
          sideOffset={6}
          className="z-50 max-h-72 w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg shadow-neutral-900/5"
        >
          <RadixSelect.ScrollUpButton className="flex justify-center py-1 text-[var(--color-ink-faint)]">
            <ChevronUp />
          </RadixSelect.ScrollUpButton>

          <RadixSelect.Viewport className="p-1">
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="relative flex cursor-pointer select-none flex-col gap-0.5 rounded-lg px-3 py-2 pr-8 text-sm text-[var(--color-ink)] outline-none data-[disabled]:cursor-not-allowed data-[highlighted]:bg-[var(--color-surface-sunken)] data-[disabled]:opacity-40"
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                {option.description && (
                  <span className="text-xs text-[var(--color-ink-faint)]">{option.description}</span>
                )}
                <RadixSelect.ItemIndicator className="absolute right-3 top-2.5 text-[var(--color-accent-soft-text)]">
                  <Check />
                </RadixSelect.ItemIndicator>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>

          <RadixSelect.ScrollDownButton className="flex justify-center py-1 text-[var(--color-ink-faint)]">
            <ChevronDown />
          </RadixSelect.ScrollDownButton>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronUp() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M12 10L8 6l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M13 4.5L6.5 11 3 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
