import { useEffect } from "react";
import { toast } from "sonner";

interface AppToastProps {
  open: boolean;
  title: string;
  description?: string;
  onClose?: () => void;
}

export function AppToast({
  open,
  title,
  description,
  onClose,
}: AppToastProps) {
  useEffect(() => {
    if (open) {
      toast(title, {
        description,
        action: onClose
          ? {
              label: "Close",
              onClick: onClose,
            }
          : undefined,
        onDismiss: onClose,
      });
    }
  }, [open, title, description, onClose]);

  return null; // ✅ Sonner does not render UI components here
}