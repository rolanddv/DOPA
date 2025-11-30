import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge as BadgeUI } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { badges, badgeCategories, Badge } from "@/data/badges";
import { Check } from "lucide-react";

interface BadgeSelectorProps {
  days: number;
  onSelect: (badge: Badge) => void;
  selectedBadge?: Badge;
}

export const BadgeSelector = ({ days, onSelect, selectedBadge }: BadgeSelectorProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [availableBadges, setAvailableBadges] = useState<Badge[]>([]);

  // Update available badges when category changes
  useEffect(() => {
    if (selectedCategory) {
      const badgesInCategory = badges.filter((b) => b.category === selectedCategory);
      setAvailableBadges(badgesInCategory);
    } else {
      setAvailableBadges([]);
    }
  }, [selectedCategory]);

  const handleBadgeSelect = (badgeText: string) => {
    const badge = availableBadges.find((b) => b.text === badgeText);
    if (badge) {
      onSelect(badge);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <h3 className="font-semibold text-foreground">
        Choisis ton badge
      </h3>
      
      {/* Category Select */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          🏷️ Catégorie
        </label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionne une catégorie..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(badgeCategories).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Badge Select */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          🎖️ Badge
        </label>
        <Select
          value={selectedBadge?.text || ""}
          onValueChange={handleBadgeSelect}
          disabled={!selectedCategory || availableBadges.length === 0}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Sélectionne un badge..." />
          </SelectTrigger>
          <SelectContent>
            {availableBadges.map((badge, index) => (
              <SelectItem key={index} value={badge.text}>
                <span className="flex items-center gap-2">
                  <span className="text-lg">{badge.emoji}</span>
                  <span className="text-sm truncate max-w-[300px]">
                    {badge.villainName || badge.text.substring(0, 50)}
                    {badge.text.length > 50 && !badge.villainName && "..."}
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selected Badge Preview */}
      {selectedBadge && (
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Badge sélectionné :</p>
          <BadgeUI variant="secondary" className="text-base py-2 px-3 h-auto">
            <span className="text-xl mr-2">{selectedBadge.emoji}</span>
            <span className="text-sm">{selectedBadge.text}</span>
            <Check className="w-4 h-4 ml-2 text-primary" />
          </BadgeUI>
        </div>
      )}
    </Card>
  );
};
