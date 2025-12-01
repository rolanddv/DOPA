import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { badges, badgeCategories } from "@/data/badges";
import { Footer } from "@/components/Footer";
import { ArrowLeft, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const BadgeGallery = () => {
  const [usedBadges, setUsedBadges] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("quotidien");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsedBadges = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Récupérer les badges des posts
      const { data: postsData } = await supabase
        .from("posts")
        .select("badge_emoji, badge_text")
        .eq("user_id", user.id)
        .not("badge_emoji", "is", null);

      // Récupérer les badges des photo_shares
      const { data: photosData } = await supabase
        .from("photo_shares")
        .select("badge_emoji, badge_text")
        .eq("user_id", user.id)
        .not("badge_emoji", "is", null);

      // Combiner et dédupliquer
      const allBadges = new Set<string>();
      
      postsData?.forEach(p => {
        if (p.badge_emoji && p.badge_text) {
          allBadges.add(`${p.badge_emoji}_${p.badge_text}`);
        }
      });
      
      photosData?.forEach(p => {
        if (p.badge_emoji && p.badge_text) {
          allBadges.add(`${p.badge_emoji}_${p.badge_text}`);
        }
      });

      // Fusionner avec localStorage pour rétrocompatibilité
      const localBadges = JSON.parse(localStorage.getItem("dopa-used-badges") || "[]");
      localBadges.forEach((b: string) => allBadges.add(b));

      setUsedBadges(Array.from(allBadges));
    };

    fetchUsedBadges();
  }, []);

  const groupedBadges = Object.keys(badgeCategories).reduce((acc, category) => {
    acc[category] = badges.filter((b) => b.category === category);
    return acc;
  }, {} as Record<string, typeof badges>);

  const isBadgeUsed = (emoji: string, text: string) => {
    return usedBadges.includes(`${emoji}_${text}`);
  };

  const usedCount = badges.filter((b) => isBadgeUsed(b.emoji, b.text)).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Button>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Tableau de Chasse</h1>
          </div>
          <div className="w-20" /> {/* Spacer for alignment */}
        </div>
      </header>

      {/* Content */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Stats */}
          <Card className="p-6 text-center bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div>
                <p className="text-4xl font-bold text-primary">{usedCount}</p>
                <p className="text-sm text-muted-foreground">Badges utilisés</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div>
                <p className="text-4xl font-bold text-foreground">{badges.length}</p>
                <p className="text-sm text-muted-foreground">Total badges</p>
              </div>
            </div>
          </Card>

          {/* Badge Gallery */}
          <Card className="p-6">
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <ScrollArea className="w-full">
                <TabsList className="inline-flex w-max mb-6">
                  {Object.entries(badgeCategories).map(([key, label]) => (
                    <TabsTrigger key={key} value={key} className="text-xs">
                      {label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </ScrollArea>

              {Object.entries(badgeCategories).map(([key, label]) => (
                <TabsContent key={key} value={key} className="mt-0">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">{label}</h3>
                  <ScrollArea className="h-[500px]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-4">
                      {groupedBadges[key]?.map((badge, index) => {
                        const used = isBadgeUsed(badge.emoji, badge.text);
                        return (
                          <div
                            key={index}
                            className={`p-4 rounded-lg border-2 transition-all ${
                              used
                                ? "border-primary bg-primary/5"
                                : "border-border bg-muted/30 opacity-60"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-3xl flex-shrink-0">{badge.emoji}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground break-words">
                                  {badge.text}
                                </p>
                                {used && (
                                  <p className="text-xs text-primary mt-1 font-semibold">
                                    ✓ Utilisé
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Les badges marqués sont ceux que tu as utilisés pour créer tes visuels.
            </p>
            <p className="mt-1">
              Continue à partager tes victoires pour compléter ta collection ! 🎯
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BadgeGallery;
