import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BadgeSelector } from "./BadgeSelector";
import { ShareToSocialDialog } from "./ShareToSocialDialog";
import { addDopaLogoToImage } from "@/lib/imageUtils";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostCreated: () => void;
}

const CreatePostModal = ({ open, onOpenChange, onPostCreated }: CreatePostModalProps) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [daysCount, setDaysCount] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      // Fetch user's days count
      supabase.auth.getUser().then(async ({ data: { user } }) => {
        if (user) {
          const { data } = await supabase
            .from("user_data")
            .select("start_date")
            .eq("user_id", user.id)
            .single();

          if (data) {
            const days = Math.floor(
              (Date.now() - new Date(data.start_date).getTime()) / (1000 * 60 * 60 * 24)
            );
            setDaysCount(days);
          }
        }
      });
    }
  }, [open]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Add DOPA logo to image
        const imageWithLogo = await addDopaLogoToImage(file);
        const processedFile = new File([imageWithLogo], file.name, { type: 'image/jpeg' });
        
        setImage(processedFile);
        setImagePreview(URL.createObjectURL(processedFile));
        
        toast({
          title: "Logo ajouté",
          description: "Le logo DOPA a été ajouté à votre image",
        });
      } catch (error) {
        console.error('Error adding logo:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter le logo à l'image",
          variant: "destructive",
        });
      }
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Erreur",
        description: "Le contenu ne peut pas être vide",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      let imagePath: string | null = null;

      // Upload image if present
      if (image) {
        const fileExt = image.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("user-photos")
          .upload(fileName, image);

        if (uploadError) throw uploadError;
        imagePath = fileName;
        
        // Get public URL for sharing
        const { data: urlData } = supabase.storage
          .from("user-photos")
          .getPublicUrl(fileName);
        
        setUploadedImageUrl(urlData.publicUrl);
      }

      // Create post
      const { error } = await supabase.from("posts").insert({
        user_id: user.id,
        content: content.trim(),
        image_path: imagePath,
        badge_emoji: selectedBadge?.emoji || null,
        badge_text: selectedBadge?.text || null,
        badge_category: selectedBadge?.category || null,
        days_count: daysCount,
      });

      if (error) throw error;

      toast({
        title: "Post publié !",
        description: "Votre accomplissement a été partagé avec la communauté",
      });

      // Reset form
      setContent("");
      setImage(null);
      setImagePreview(null);
      setSelectedBadge(null);
      onOpenChange(false);
      onPostCreated();
      
      // Show share dialog if image was uploaded
      if (imagePath && uploadedImageUrl) {
        setShowShareDialog(true);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Erreur",
        description: "Impossible de publier le post",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Créer une publication</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Image upload */}
            <div>
              <Label>Photo (optionnelle)</Label>
              {imagePreview ? (
                <div className="relative mt-2 aspect-square rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="mt-2 flex items-center justify-center h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Camera className="h-8 w-8" />
                    <span className="text-sm">Ajouter une photo</span>
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Badge selector */}
            <div>
              <Label>Badge (optionnel)</Label>
              <div className="mt-2">
                <BadgeSelector
                  days={daysCount ?? 0}
                  onSelect={setSelectedBadge}
                  selectedBadge={selectedBadge}
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <Label>Message</Label>
              <Textarea
                placeholder="Partagez votre accomplissement avec la communauté..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={500}
                rows={4}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {content.length}/500
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} disabled={uploading}>
                {uploading ? "Publication..." : "Publier"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <ShareToSocialDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        imageUrl={uploadedImageUrl || ""}
      />
    </>
  );
};

export default CreatePostModal;
