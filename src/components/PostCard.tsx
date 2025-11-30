import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Share2, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import DopaButton from "./DopaButton";
import CommentSection from "./CommentSection";
import UserAvatar from "./UserAvatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PostCardProps {
  post: {
    id: string;
    user_id: string;
    content: string;
    image_path: string | null;
    badge_emoji: string | null;
    badge_text: string | null;
    badge_category: string | null;
    days_count: number | null;
    created_at: string;
    profiles: {
      username: string | null;
      avatar_url: string | null;
      first_name: string | null;
      last_name: string | null;
    };
    dopas: { id: string; user_id: string }[];
    comments: { id: string }[];
  };
  onRefresh: () => void;
}

const PostCard = ({ post, onRefresh }: PostCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { toast } = useToast();

  // Load image URL if exists
  useEffect(() => {
    if (post.image_path) {
      const { data } = supabase.storage
        .from("user-photos")
        .getPublicUrl(post.image_path);
      
      if (data) setImageUrl(data.publicUrl);
    }
  }, [post.image_path]);

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post de ${post.profiles.username || "un utilisateur"}`,
          text: post.content,
          url,
        });
      } catch (error) {
        console.log("Partage annulé");
      }
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Lien copié !",
        description: "Le lien du post a été copié dans le presse-papier",
      });
    }
  };

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserAvatar
            username={post.profiles.username}
            avatarUrl={post.profiles.avatar_url}
          />
          <div>
            <p className="font-semibold text-sm">
              {post.profiles.first_name && post.profiles.last_name
                ? `${post.profiles.first_name} ${post.profiles.last_name}`
                : post.profiles.username || "Utilisateur"}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), {
                addSuffix: true,
                locale: fr,
              })}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {/* Badge si présent */}
      {post.badge_emoji && post.badge_text && (
        <div className="px-4 pb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <span className="text-lg">{post.badge_emoji}</span>
            <span>{post.badge_text}</span>
            {post.days_count && (
              <span className="text-xs opacity-70">• {post.days_count}j</span>
            )}
          </div>
        </div>
      )}

      {/* Image */}
      {imageUrl && (
        <div className="relative aspect-video max-h-[400px] bg-muted">
          <img
            src={imageUrl}
            alt="Post"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <p className="text-sm whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Actions */}
      <div className="px-4 pb-3 flex items-center gap-4">
        <DopaButton postId={post.id} dopas={post.dopas} onUpdate={onRefresh} />
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => setShowComments(!showComments)}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-xs">{post.comments.length}</span>
        </Button>
        <Button variant="ghost" size="sm" className="gap-2" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <CommentSection postId={post.id} onUpdate={onRefresh} />
      )}
    </Card>
  );
};

export default PostCard;
