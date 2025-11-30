import { Newspaper } from "lucide-react";
import { Link } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Articles = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link to="/feed">
            <h1 className="text-2xl font-bold text-primary cursor-pointer hover:opacity-80 transition-opacity">
              DOPA
            </h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <Newspaper className="h-24 w-24 text-muted-foreground" />
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">Blog spécialisé</h2>
            <p className="text-muted-foreground">
              Restez informé des dernières nouveautés, soirées No/Low, sélection des meilleures bières sans alcool, les meilleurs mocktails, etc.
            </p>
          </div>

          {/* Placeholder pour les futurs articles */}
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Prochainement</CardTitle>
              <CardDescription>
                Cette section contiendra bientôt des articles sur les soirées No/Low, les meilleures bières sans alcool, les mocktails et bien plus encore !
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Nous préparons du contenu exclusif pour vous. Revenez bientôt pour découvrir nos articles spécialisés !
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Articles;
