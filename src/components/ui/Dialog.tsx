'use client';

import * as React from 'react';
import {Dialog as BaseDialog} from '@base-ui/react/dialog';

/**
 * Dialog — Phase B.03 wrapper around base-ui's Dialog primitive.
 *
 * Centralizes the import path so callers don't reach into `@base-ui/react`
 * directly. Adds the project's locked styling on top of the unstyled base
 * (Phase 1.03 `.dialog` / `.dialog-backdrop` classes in globals.css).
 *
 * Compositional surface:
 *   <Dialog.Root open onOpenChange>
 *     <Dialog.Portal>
 *       <Dialog.Backdrop />
 *       <Dialog.Popup>
 *         <Dialog.Title />
 *         <Dialog.Description />
 *         <Dialog.Close />
 *       </Dialog.Popup>
 *     </Dialog.Portal>
 *   </Dialog.Root>
 *
 * The Popup + Backdrop accept `className` overrides for callers (modal,
 * lightbox, etc.) that need bespoke layout — the default classes line up
 * with the Phase 1.03 component spec.
 */

export const Root = BaseDialog.Root;
export const Trigger = BaseDialog.Trigger;
export const Portal = BaseDialog.Portal;
export const Close = BaseDialog.Close;
export const Title = BaseDialog.Title;
export const Description = BaseDialog.Description;

type BackdropProps = React.ComponentPropsWithoutRef<typeof BaseDialog.Backdrop>;
type PopupProps = React.ComponentPropsWithoutRef<typeof BaseDialog.Popup>;

function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export const Backdrop = React.forwardRef<HTMLDivElement, BackdropProps>(
  function Backdrop({className, ...rest}, ref) {
    return (
      <BaseDialog.Backdrop
        ref={ref}
        {...rest}
        className={cn('dialog-backdrop', typeof className === 'string' ? className : undefined)}
      />
    );
  },
);

export const Popup = React.forwardRef<HTMLDivElement, PopupProps>(
  function Popup({className, ...rest}, ref) {
    return (
      <BaseDialog.Popup
        ref={ref}
        {...rest}
        className={cn('dialog', typeof className === 'string' ? className : undefined)}
      />
    );
  },
);

const Dialog = {
  Root,
  Trigger,
  Portal,
  Backdrop,
  Popup,
  Title,
  Description,
  Close,
};

export default Dialog;
