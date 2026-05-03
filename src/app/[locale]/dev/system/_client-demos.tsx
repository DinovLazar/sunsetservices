'use client';

import * as React from 'react';
import {Dialog} from '@base-ui/react/dialog';
import {Tooltip} from '@base-ui/react/tooltip';

export function DialogDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger render={<button type="button" className="btn btn-primary btn-md" />}>
        Open dialog
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="dialog-backdrop" />
        <Dialog.Popup className="dialog">
          <Dialog.Title className="dialog-title">Schedule a callback</Dialog.Title>
          <Dialog.Description className="dialog-description">
            We&apos;ll call you within 24 hours to talk about the project. The dialog traps focus,
            closes on Esc, and animates in via base-ui defaults.
          </Dialog.Description>
          <p className="text-body">
            This is the body of the dialog — placeholder content. Replace with form fields,
            confirmation copy, or whatever the use case calls for.
          </p>
          <div className="dialog-footer">
            <Dialog.Close render={<button type="button" className="btn btn-ghost btn-md" />}>
              Cancel
            </Dialog.Close>
            <Dialog.Close render={<button type="button" className="btn btn-primary btn-md" />}>
              Confirm
            </Dialog.Close>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function TooltipDemo() {
  return (
    <Tooltip.Provider delay={300} closeDelay={0}>
      <Tooltip.Root>
        <Tooltip.Trigger
          render={<button type="button" className="btn btn-secondary btn-md" />}
        >
          Hover or focus me
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Positioner sideOffset={8}>
            <Tooltip.Popup className="tooltip">
              Tooltips appear on hover or focus, with a 300ms delay.
              <Tooltip.Arrow className="tooltip-arrow" />
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
