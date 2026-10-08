import type { ReactNode } from "react";

import { Character, Emoji } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Milestone } from "@/lib/plan";

// Celebração dos marcos (dias 7, 14 e 21), como o milestone-celebration do Calm Kids. Fica num
// arquivo próprio para o shell do app não carregar a trilha do Plano junto.

export function MilestoneCelebration({
  milestone,
  onClose,
  footer,
}: {
  milestone: Milestone | null;
  onClose: () => void;
  footer?: ReactNode;
}) {
  return (
    <Dialog open={milestone !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] rounded-2xl border-border text-center sm:max-w-sm">
        {milestone && (
          <>
            {milestone.pose ? (
              <Character
                pose={milestone.pose}
                className="mx-auto h-44 motion-safe:animate-in motion-safe:zoom-in-75 motion-safe:duration-500"
              />
            ) : (
              <Emoji
                name={milestone.emoji}
                className="mx-auto size-28 motion-safe:animate-in motion-safe:zoom-in-75 motion-safe:duration-500"
              />
            )}
            <DialogHeader className="items-center text-center">
              <DialogTitle className="font-display text-xl font-extrabold">
                {milestone.title}
              </DialogTitle>
              <DialogDescription className="text-sm leading-6">
                {milestone.description}
              </DialogDescription>
            </DialogHeader>
            {footer}
            <Button className="h-11 rounded-xl" onClick={onClose}>
              Continuar
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
