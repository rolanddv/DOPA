import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PanicButtonProps {
  userId: string;
  emergencyTaskPersonal?: string | null;
  onTaskSaved?: () => void;
}

const SUGGESTED_TASKS = [
  { emoji: "🚶", text: "Faire une promenade de 10 minutes" },
  { emoji: "💧", text: "Boire un grand verre d'eau" },
  { emoji: "📞", text: "Appeler un ami ou un proche" },
  { emoji: "🧘", text: "Méditer 5 minutes" },
  { emoji: "🎵", text: "Écouter sa musique préférée" },
  { emoji: "✍️", text: "Écrire dans un journal ce que tu ressens" },
  { emoji: "🏃", text: "Faire 20 jumping jacks" },
  { emoji: "🍵", text: "Se préparer un thé ou une boisson chaude" },
];

export const PanicButton = ({ userId, emergencyTaskPersonal, onTaskSaved }: PanicButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [personalTask, setPersonalTask] = useState(emergencyTaskPersonal || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setPersonalTask(emergencyTaskPersonal || "");
  }, [emergencyTaskPersonal]);

  const handleSavePersonalTask = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("user_data")
        .update({ emergency_task_personal: personalTask })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "✅ Tâche personnelle sauvegardée",
        description: "Ta tâche d'urgence a été enregistrée avec succès.",
      });

      onTaskSaved?.();
    } catch (error) {
      console.error("Error saving personal task:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder ta tâche personnelle.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full h-16 text-lg font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg"
        size="lg"
      >
        <AlertCircle className="w-6 h-6 mr-2" />
        🆘 BOUTON PANIC
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">
              Tu es plus fort que cette envie ! 💪
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              Voici des idées pour t'aider à surmonter ce moment difficile.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Tâche personnelle en premier si elle existe */}
            {emergencyTaskPersonal && (
              <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
                <h3 className="font-semibold text-lg mb-2 text-primary">
                  ⭐ Ma tâche personnelle
                </h3>
                <p className="text-base">{emergencyTaskPersonal}</p>
              </div>
            )}

            {/* Tâches suggérées */}
            <div>
              <h3 className="font-semibold text-lg mb-3">
                Suggestions d'activités
              </h3>
              <div className="space-y-2">
                {SUGGESTED_TASKS.map((task, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <span className="text-2xl flex-shrink-0">{task.emoji}</span>
                    <span className="text-base">{task.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section pour définir sa tâche personnelle */}
            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-3">
                Définis ta propre tâche d'urgence
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Cette tâche apparaîtra en premier dans la liste la prochaine fois.
              </p>
              <Textarea
                value={personalTask}
                onChange={(e) => setPersonalTask(e.target.value)}
                placeholder="Ex: Appeler mon frère, faire le tour du pâté de maisons, etc."
                className="mb-3 min-h-[100px]"
              />
              <Button
                onClick={handleSavePersonalTask}
                disabled={isSaving || !personalTask.trim()}
                className="w-full"
              >
                {isSaving ? "Sauvegarde..." : "💾 Sauvegarder ma tâche personnelle"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
