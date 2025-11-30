import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface RelapseButtonProps {
  userId: string;
  onReset?: () => void;
}

export const RelapseButton = ({ userId, onReset }: RelapseButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const { error } = await supabase
        .from("user_data")
        .update({ start_date: new Date().toISOString() })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "💪 Un nouveau départ",
        description: "Ce n'est pas un échec, c'est une nouvelle chance de réussir. Chaque jour est une opportunité !",
      });

      setIsOpen(false);
      onReset?.();
    } catch (error) {
      console.error("Error resetting counter:", error);
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser le compteur.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="w-full border-muted-foreground/30 text-muted-foreground hover:bg-muted"
      >
        😔 J'ai craqué
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center text-xl">
              Es-tu sûr(e) de vouloir réinitialiser ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-base space-y-3">
              <p>
                Cette action va remettre ton compteur à zéro et redémarrer ton parcours.
              </p>
              <p className="font-semibold text-foreground">
                Rappelle-toi : chaque rechute est une opportunité d'apprendre. 
                Tu es capable de réussir ! 💪
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              disabled={isResetting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isResetting ? "Réinitialisation..." : "Oui, réinitialiser"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
