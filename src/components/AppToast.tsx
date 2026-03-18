import * as React from "react";
import { ToastProvider, Toast, ToastTitle, ToastDescription, ToastAction } from "@shadcn/ui/toast";

interface AppToastProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
}

export function AppToast({ open, title, description, onClose }: AppToastProps) {
  return (
    <ToastProvider swipeDirection="right">
      <Toast open={open} onOpenChange={onClose}>
        <ToastTitle>{title}</ToastTitle>
        {description && <ToastDescription>{description}</ToastDescription>}
        <ToastAction altText="Close" onClick={onClose}>
          Close
        </ToastAction>
      </Toast>
    </ToastProvider>
  );
}
