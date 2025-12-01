import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import PostCard from "@/components/PostCard";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import CreatePostModal from "@/components/CreatePostModal";
import { useToast } from "@/hooks/use-toast";

interface Post {
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
}

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles!posts_user_id_profiles_fkey(username, avatar_url, first_name, last_name),
          dopas(id, user_id),
          comments(id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le fil d'actualité",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("posts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        () => {
          fetchPosts();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "dopas",
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 
            className="text-2xl font-bold text-primary cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={fetchPosts}
          >
            DOPA
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchPosts}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Feed */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Aucune publication pour le moment
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Créer le premier post
            </Button>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onRefresh={fetchPosts} />
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <Button
        size="icon"
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg"
        onClick={() => setShowCreateModal(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Create Post Modal */}
      <CreatePostModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onPostCreated={fetchPosts}
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Feed;
