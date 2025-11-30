import { useNavigate, useLocation } from "react-router-dom";
import { User, Users, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          <Button
            variant="ghost"
            size="icon"
            className={`flex flex-col gap-1 h-auto py-2 ${
              isActive("/me") ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => navigate("/me")}
          >
            <User className="h-6 w-6" />
            <span className="text-xs">MON DOPA</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`flex flex-col gap-1 h-auto py-2 ${
              isActive("/feed") ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => navigate("/feed")}
          >
            <Users className="h-6 w-6" />
            <span className="text-xs">DOPA CLUB</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`flex flex-col gap-1 h-auto py-2 ${
              isActive("/articles") ? "text-primary" : "text-muted-foreground"
            }`}
            onClick={() => navigate("/articles")}
          >
            <Newspaper className="h-6 w-6" />
            <span className="text-xs">DOPArticles</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
