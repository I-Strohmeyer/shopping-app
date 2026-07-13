import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}

export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
}: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40 sheet-overlay" />
        <Dialog.Content
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl",
            "max-h-[92dvh] overflow-y-auto overflow-x-hidden outline-none",
            "sheet-content",
            // On md+: centered modal instead of bottom sheet
            "md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2",
            "md:w-[480px] md:rounded-2xl md:max-h-[85dvh]",
          )}
        >
          {/* Drag handle (mobile only) */}
          <div className="flex justify-center pt-3 pb-1 md:hidden" aria-hidden>
            <div className="w-10 h-1 bg-slate-200 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 sticky top-0 bg-white z-10">
            <Dialog.Title className="text-base font-semibold text-slate-900">
              {title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-500"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>

          {description && (
            <Dialog.Description className="sr-only">
              {description}
            </Dialog.Description>
          )}

          <div className="p-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
