import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PartyPopper } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DopaButtonProps {
  postId: string;
  dopas: { id: string; user_id: string }[];
  onUpdate: () => void;
}

const DopaButton = ({ postId, dopas, onUpdate }: DopaButtonProps) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id || null);
    });
  }, []);

  const hasDopad = currentUserId
    ? dopas.some((d) => d.user_id === currentUserId)
    : false;

  const handleDopa = async () => {
    if (!currentUserId) return;

    try {
      if (hasDopad) {
        // Remove dopa
        const dopaToRemove = dopas.find((d) => d.user_id === currentUserId);
        if (dopaToRemove) {
          const { error } = await supabase
            .from("dopas")
            .delete()
            .eq("id", dopaToRemove.id);

          if (error) throw error;
        }
      } else {
        // Add dopa with animation
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 600);

        const { error } = await supabase.from("dopas").insert({
          post_id: postId,
          user_id: currentUserId,
        });

        if (error) throw error;
      }

      onUpdate();
    } catch (error) {
      console.error("Error toggling dopa:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le dopa",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`gap-2 transition-all ${isAnimating ? "scale-125" : ""}`}
      onClick={handleDopa}
    >
      <PartyPopper 
        className={`h-5 w-5 transition-all ${isAnimating ? "animate-bounce" : ""} ${
          hasDopad 
            ? "text-primary fill-primary" 
            : "text-muted-foreground/40"
        }`}
      />
      <span className={`text-xs font-semibold ${hasDopad ? "text-primary" : "text-muted-foreground"}`}>
        {dopas.length}
      </span>
    </Button>
  );
};

export default DopaButton;
