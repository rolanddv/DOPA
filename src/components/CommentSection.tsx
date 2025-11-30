import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import UserAvatar from "./UserAvatar";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string | null;
    avatar_url: string | null;
    first_name: string | null;
    last_name: string | null;
  };
}

interface CommentSectionProps {
  postId: string;
  onUpdate: () => void;
}

const CommentSection = ({ postId, onUpdate }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();

    // Subscribe to new comments
    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `post_id=eq.${postId}`,
        },
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          profiles!comments_user_id_profiles_fkey(username, avatar_url, first_name, last_name)
        `)
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || loading) return;

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase.from("comments").insert({
        post_id: postId,
        user_id: user.id,
        content: newComment.trim(),
      });

      if (error) throw error;

      setNewComment("");
      onUpdate();
    } catch (error) {
      console.error("Error posting comment:", error);
      toast({
        title: "Erreur",
        description: "Impossible de publier le commentaire",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t border-border">
      {/* Comments list */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <UserAvatar
              username={comment.profiles.username}
              avatarUrl={comment.profiles.avatar_url}
              size="sm"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">
                  {comment.profiles.username || 
                   (comment.profiles.first_name && comment.profiles.last_name
                     ? `${comment.profiles.first_name} ${comment.profiles.last_name}`
                     : "Utilisateur")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </span>
              </div>
              <p className="text-sm mt-1">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Comment input */}
      <form onSubmit={handleSubmit} className="p-4 flex gap-2 border-t border-border">
        <Input
          placeholder="Ajouter un commentaire..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          maxLength={200}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!newComment.trim() || loading}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default CommentSection;
