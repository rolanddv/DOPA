import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareToSocialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
}

export const ShareToSocialDialog = ({ open, onOpenChange, imageUrl }: ShareToSocialDialogProps) => {
  const handleDownloadForPlatform = async (platform: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dopa-${platform}-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      if (platform === 'instagram') {
        toast.success("Image téléchargée !", {
          description: "Ouvrez Instagram et partagez l'image en story ou post 📱"
        });
      } else if (platform === 'tiktok') {
        toast.success("Image téléchargée !", {
          description: "Ouvrez TikTok et créez une vidéo avec cette image 🎵"
        });
      }
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error("Erreur lors du téléchargement");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-primary/5 via-background to-primary/10 border-2 border-primary/20 shadow-2xl animate-fade-in">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Partage ta victoire ! 🎉
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-6">
          <p className="text-base text-foreground text-center font-medium mb-2">
            Ton post est publié ! Partage-le aussi sur tes réseaux pour inspirer ta communauté 💪
          </p>
          
          <Button
            onClick={() => handleDownloadForPlatform('instagram')}
            className="w-full gap-3 h-14 text-base font-semibold bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <span className="text-3xl">📱</span>
            Partager sur Instagram
          </Button>
          
          <Button
            onClick={() => handleDownloadForPlatform('tiktok')}
            className="w-full gap-3 h-14 text-base font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <span className="text-3xl">🎵</span>
            Partager sur TikTok
          </Button>
          
          <Button
            onClick={() => onOpenChange(false)}
            variant="ghost"
            className="w-full mt-2 hover:bg-primary/10"
          >
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
