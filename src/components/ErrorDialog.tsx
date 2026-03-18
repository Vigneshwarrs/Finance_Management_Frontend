import * as React from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction } from "@/components/ui/alert-dialog";

interface ErrorDialogProps {
  open: boolean;
  error: Error | null;
  onClose: () => void;
}

export function ErrorDialog({ open, error, onClose }: ErrorDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-error">Something went wrong</AlertDialogTitle>
          <AlertDialogDescription>
            {error?.message || "An unexpected error occurred."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>OK</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
