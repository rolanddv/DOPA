import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Download, Share2, Facebook, Instagram, X, Cloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BadgeSelector } from "./BadgeSelector";
import { Badge } from "@/data/badges";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import dopaLogo from "@/assets/dopa-logo.png";
import { supabase } from "@/integrations/supabase/client";


interface PhotoShareProps {
  days: number;
}

export const PhotoShare = ({ days }: PhotoShareProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<Badge | undefined>();
  const [compositeImage, setCompositeImage] = useState<string | null>(null);
  const [badgePosition, setBadgePosition] = useState({ x: 50, y: 35 });
  const [badgeScale, setBadgeScale] = useState(1);
  const [badgeRotation, setBadgeRotation] = useState(0);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Touch gesture state
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; distance: number; angle: number } | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Create composite image with badge overlay
  useEffect(() => {
    if (selectedImage && selectedBadge && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        // Set canvas size to match image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image
        ctx.drawImage(img, 0, 0);

        // Draw overlay gradient
        const gradient = ctx.createLinearGradient(0, img.height * 0.6, 0, img.height);
        gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0.75)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, img.width, img.height);

        // Draw badge with transformations
        const badgeSize = Math.min(img.width, img.height) * 0.3;
        const badgeX = img.width * (badgePosition.x / 100);
        const badgeY = img.height * (badgePosition.y / 100);

        ctx.save();
        ctx.translate(badgeX, badgeY);
        ctx.rotate((badgeRotation * Math.PI) / 180);
        ctx.scale(badgeScale, badgeScale);

        // Badge background
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.beginPath();
        ctx.arc(0, 0, badgeSize / 2, 0, Math.PI * 2);
        ctx.fill();

        // Badge emoji
        ctx.font = `${badgeSize * 0.5}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(selectedBadge.emoji, 0, 0);

        ctx.restore();

        // Badge text with background
        const textY = badgeY + badgeSize / 2 + 40;
        const maxWidth = img.width * 0.8;
        ctx.font = `bold ${Math.min(img.width * 0.06, 48)}px Arial`;
        const textMetrics = ctx.measureText(selectedBadge.text);
        const textWidth = Math.min(textMetrics.width, maxWidth);
        
        // Text background
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(
          badgeX - textWidth / 2 - 20,
          textY - 40,
          textWidth + 40,
          80
        );

        // Badge text
        ctx.fillStyle = "white";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Wrap text if needed
        const words = selectedBadge.text.split(" ");
        let line = "";
        let lines: string[] = [];
        
        for (let word of words) {
          const testLine = line + word + " ";
          const testWidth = ctx.measureText(testLine).width;
          if (testWidth > maxWidth && line !== "") {
            lines.push(line.trim());
            line = word + " ";
          } else {
            line = testLine;
          }
        }
        lines.push(line.trim());

        lines.forEach((line, i) => {
          ctx.fillText(line, badgeX, textY + (i - lines.length / 2 + 0.5) * 50);
        });

        // Draw DOPA logo image at bottom right
        const logoImg = new Image();
        logoImg.src = dopaLogo;
        logoImg.onload = () => {
          const logoHeight = img.height * 0.08;
          const logoWidth = logoImg.width * (logoHeight / logoImg.height);
          ctx.drawImage(
            logoImg,
            img.width - logoWidth - 20,
            img.height - logoHeight - 20,
            logoWidth,
            logoHeight
          );
          // Update composite after logo is drawn
          setCompositeImage(canvas.toDataURL("image/png"));
        };

      };
      img.src = selectedImage;
    } else {
      setCompositeImage(null);
    }
  }, [selectedImage, selectedBadge, days, badgePosition, badgeScale, badgeRotation]);

  const handleDownload = () => {
    if (compositeImage) {
      // Track badge usage
      if (selectedBadge) {
        const usedBadges = JSON.parse(localStorage.getItem("dopa-used-badges") || "[]");
        const badgeKey = `${selectedBadge.emoji}_${selectedBadge.text}`;
        if (!usedBadges.includes(badgeKey)) {
          usedBadges.push(badgeKey);
          localStorage.setItem("dopa-used-badges", JSON.stringify(usedBadges));
        }
      }

      const link = document.createElement("a");
      link.download = `dopa-${days}-jours.png`;
      link.href = compositeImage;
      link.click();
      toast({
        title: "Image téléchargée !",
        description: "Tu peux maintenant la partager sur tes réseaux.",
      });
    }
  };

  const saveToCloud = async () => {
    if (!compositeImage || !selectedBadge) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erreur",
          description: "Tu dois être connecté pour sauvegarder.",
          variant: "destructive",
        });
        return;
      }

      // Convert base64 to blob
      const response = await fetch(compositeImage);
      const blob = await response.blob();

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `${user.id}/${timestamp}-${selectedBadge.emoji}.png`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("user-photos")
        .upload(fileName, blob, {
          contentType: "image/png",
          cacheControl: "3600",
        });

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { error: dbError } = await supabase
        .from("photo_shares")
        .insert({
          user_id: user.id,
          file_path: fileName,
          badge_emoji: selectedBadge.emoji,
          badge_text: selectedBadge.text,
          badge_category: selectedBadge.category,
        });

      if (dbError) throw dbError;

      toast({
        title: "✅ Photo sauvegardée !",
        description: "Ta photo a été sauvegardée dans le cloud",
      });

      // Track badge usage
      const usedBadges = JSON.parse(localStorage.getItem("dopa-used-badges") || "[]");
      const badgeKey = `${selectedBadge.emoji}_${selectedBadge.text}`;
      if (!usedBadges.includes(badgeKey)) {
        usedBadges.push(badgeKey);
        localStorage.setItem("dopa-used-badges", JSON.stringify(usedBadges));
      }
    } catch (error) {
      console.error("Error saving photo:", error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la photo.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleShare = (platform: string) => {
    // Track badge usage
    if (selectedBadge) {
      const usedBadges = JSON.parse(localStorage.getItem("dopa-used-badges") || "[]");
      const badgeKey = `${selectedBadge.emoji}_${selectedBadge.text}`;
      if (!usedBadges.includes(badgeKey)) {
        usedBadges.push(badgeKey);
        localStorage.setItem("dopa-used-badges", JSON.stringify(usedBadges));
      }
    }

    const message = `🎉 ${days} ${days === 1 ? "jour" : "jours"} sans alcool avec DOPA! ${selectedBadge?.text || ""} 💪 #DOPA #JusteToi`;
    
    let url = "";
    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(message)}`;
        window.open(url, "_blank", "width=600,height=400");
        break;
      case "instagram":
        handleDownload();
        toast({
          title: "Instagram",
          description: "Image téléchargée ! Ouvre Instagram et partage-la en story ou post.",
        });
        break;
      case "tiktok":
        handleDownload();
        toast({
          title: "TikTok",
          description: "Image téléchargée ! Ouvre TikTok et crée une vidéo avec ton image.",
        });
        break;
    }
  };

  // Touch gesture handlers
  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchAngle = (touch1: React.Touch, touch2: React.Touch) => {
    return Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * 180 / Math.PI;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!selectedBadge || !imageContainerRef.current) return;
    
    if (e.touches.length === 1) {
      // Single touch for position
      const touch = e.touches[0];
      const rect = imageContainerRef.current.getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width) * 100;
      const y = ((touch.clientY - rect.top) / rect.height) * 100;
      setTouchStart({ x, y, distance: 0, angle: 0 });
    } else if (e.touches.length === 2) {
      // Two fingers for scale and rotation
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      const angle = getTouchAngle(e.touches[0], e.touches[1]);
      const touch = e.touches[0];
      const rect = imageContainerRef.current.getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width) * 100;
      const y = ((touch.clientY - rect.top) / rect.height) * 100;
      setTouchStart({ x, y, distance, angle });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!selectedBadge || !touchStart || !imageContainerRef.current) return;
    e.preventDefault();

    if (e.touches.length === 1) {
      // Update position
      const touch = e.touches[0];
      const rect = imageContainerRef.current.getBoundingClientRect();
      const x = Math.max(10, Math.min(90, ((touch.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(10, Math.min(90, ((touch.clientY - rect.top) / rect.height) * 100));
      setBadgePosition({ x, y });
    } else if (e.touches.length === 2) {
      // Update scale and rotation
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      const angle = getTouchAngle(e.touches[0], e.touches[1]);
      
      const scaleChange = distance / touchStart.distance;
      const newScale = Math.max(0.5, Math.min(2, badgeScale * scaleChange));
      
      const angleDiff = angle - touchStart.angle;
      const newRotation = badgeRotation + angleDiff;
      
      setBadgeScale(newScale);
      setBadgeRotation(newRotation);
      
      setTouchStart({ ...touchStart, distance, angle });
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  return (
    <Card className="p-6 md:p-8 animate-fade-in">
      <canvas ref={canvasRef} className="hidden" />
      
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-foreground">
        Partage ton DOPAccomplissement
      </h2>

      <div className="space-y-6">
        {/* Image preview */}
        {compositeImage ? (
          <div 
            ref={imageContainerRef}
            className="relative max-w-md mx-auto rounded-2xl overflow-hidden shadow-lg touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={compositeImage}
              alt="Votre accomplissement"
              className="w-full h-auto"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => {
                setSelectedImage(null);
                setSelectedBadge(undefined);
              }}
            >
              <X className="w-4 h-4" />
            </Button>
            {selectedBadge && (
              <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                ✌️ Pincer pour zoom • ↻ Tourner • 👆 Glisser
              </div>
            )}
          </div>
        ) : selectedImage ? (
          <div className="relative max-w-md mx-auto rounded-2xl overflow-hidden shadow-lg">
            <img
              src={selectedImage}
              alt="Votre photo"
              className="w-full h-auto"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="aspect-square max-w-md mx-auto rounded-2xl border-2 border-dashed border-border bg-secondary/30 flex items-center justify-center">
            <div className="text-center p-8">
              <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Ajoute une photo pour créer ton visuel
              </p>
            </div>
          </div>
        )}

        {/* Upload controls */}
        <div className="flex gap-3 justify-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleImageUpload}
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground"
          >
            <Camera className="w-4 h-4 mr-2" />
            {selectedImage ? "Changer la photo" : "Prendre une photo"}
          </Button>
        </div>

        {/* Badge selector */}
        {selectedImage && (
          <div className="animate-fade-in">
            <BadgeSelector
              days={days}
              onSelect={setSelectedBadge}
              selectedBadge={selectedBadge}
            />
          </div>
        )}

        {/* Badge controls */}
        {selectedImage && selectedBadge && (
          <div className="space-y-4 p-4 bg-secondary/30 rounded-lg animate-fade-in">
            <h4 className="font-semibold text-foreground">Ajuster le badge</h4>
            <p className="text-xs text-muted-foreground">
              💡 Sur mobile : utilisez vos doigts pour ajuster le badge directement
            </p>
            
            <div className="space-y-2">
              <Label>Position horizontale</Label>
              <Slider
                value={[badgePosition.x]}
                onValueChange={(v) => setBadgePosition(p => ({ ...p, x: v[0] }))}
                min={10}
                max={90}
                step={1}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Position verticale</Label>
              <Slider
                value={[badgePosition.y]}
                onValueChange={(v) => setBadgePosition(p => ({ ...p, y: v[0] }))}
                min={10}
                max={90}
                step={1}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Taille ({Math.round(badgeScale * 100)}%)</Label>
              <Slider
                value={[badgeScale * 100]}
                onValueChange={(v) => setBadgeScale(v[0] / 100)}
                min={50}
                max={200}
                step={5}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Rotation ({badgeRotation}°)</Label>
              <Slider
                value={[badgeRotation]}
                onValueChange={(v) => setBadgeRotation(v[0])}
                min={-180}
                max={180}
                step={5}
              />
            </div>
          </div>
        )}

        {/* Download and share */}
        {compositeImage && (
          <div className="pt-4 border-t border-border space-y-4 animate-fade-in">
            <Button
              onClick={saveToCloud}
              disabled={saving}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Cloud className="w-4 h-4 mr-2" />
              {saving ? "Sauvegarde..." : "Sauvegarder dans ma galerie"}
            </Button>

            <Button
              onClick={handleDownload}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger l'image
            </Button>

            <div>
              <h3 className="font-semibold mb-3 text-foreground text-center">
                Partager sur les réseaux
              </h3>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button
                  onClick={() => handleShare("facebook")}
                  className="bg-[#1877F2] hover:bg-[#1877F2]/90 text-white"
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  onClick={() => handleShare("instagram")}
                  className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90 text-white"
                >
                  <Instagram className="w-4 h-4 mr-2" />
                  Instagram
                </Button>
                <Button
                  onClick={() => handleShare("tiktok")}
                  className="bg-black hover:bg-black/90 text-white"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  TikTok
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
