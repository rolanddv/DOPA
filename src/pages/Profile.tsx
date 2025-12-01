import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { DayCounter } from "@/components/DayCounter";
import { HealthStats } from "@/components/HealthStats";
import { UserHabitsCard } from "@/components/UserHabitsCard";
import { PanicButton } from "@/components/PanicButton";
import { RelapseButton } from "@/components/RelapseButton";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Award, LogOut, User, RefreshCw, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Profile = () => {
  const [userData, setUserData] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setHasOnboarded } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data: userData, error: userError } = await supabase
        .from("user_data")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (userError) throw userError;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      setUserData(userData);
      setProfile(profileData);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erreur",
          description: "Veuillez sélectionner une image",
          variant: "destructive",
        });
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erreur",
          description: "L'image ne doit pas dépasser 5MB",
          variant: "destructive",
        });
        return;
      }

      setUploading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Supprimer l'ancien avatar s'il existe
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload du nouveau fichier
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Mettre à jour le profil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });

      toast({
        title: "Photo de profil mise à jour",
        description: "Votre photo a été enregistrée avec succès",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'uploader la photo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleResetOnboarding = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { error } = await supabase
        .from("user_data")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      setHasOnboarded(false);
      toast({
        title: "Parcours réinitialisé",
        description: "Veuillez refaire le questionnaire",
      });
      
      // Rediriger vers l'onboarding sans déconnecter
      navigate("/onboarding");
    } catch (error) {
      console.error("Error resetting onboarding:", error);
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser le parcours",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Non authentifié");

      // Appeler l'edge function pour supprimer le compte
      const { data, error } = await supabase.functions.invoke('delete-user', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Compte supprimé",
        description: "Votre compte a été supprimé définitivement",
      });

      // Déconnecter et rediriger
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le compte",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header avec profil */}
      <div className="bg-gradient-to-b from-primary/20 to-background pt-8 pb-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <Link to="/feed">
              <h1 className="text-2xl font-bold text-primary cursor-pointer hover:opacity-80 transition-opacity">
                DOPA
              </h1>
            </Link>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>

          {/* Profil card */}
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-lg"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">
                  {profile?.first_name && profile?.last_name
                    ? `${profile.first_name} ${profile.last_name}`
                    : profile?.username || "Utilisateur"}
                </h2>
                {profile?.bio && (
                  <p className="text-sm text-muted-foreground mt-2">{profile.bio}</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* DOPAccomplissement Counter */}
        {userData && profile && (
          <DayCounter
            startDate={new Date(userData.start_date)}
            firstName={profile.first_name || undefined}
            gender={userData.sexe as "Homme" | "Femme" | "Autre"}
          />
        )}

        {/* Panic Button - En cas de crise */}
        {userData && (
          <PanicButton
            userId={userData.user_id}
            emergencyTaskPersonal={userData.emergency_task_personal}
            onTaskSaved={fetchUserData}
          />
        )}

        {/* Mes habitudes */}
        {userData && (
          <UserHabitsCard
            userData={{
              age: userData.age,
              sexe: userData.sexe,
              taille_cm: userData.taille_cm,
              poids_actuel_kg: userData.poids_actuel_kg,
              poids_avant_arret_kg: userData.poids_avant_arret_kg,
              alcool_types: userData.alcool_types,
              alcool_frequence: userData.alcool_frequence,
              budget_alcool_hebdo_eur: userData.budget_alcool_hebdo_eur,
              sommeil_base: userData.sommeil_base,
              energie_base: userData.energie_base,
              frequence_cardiaque_repos: userData.frequence_cardiaque_repos,
              stress_base: userData.stress_base,
              objectif_jours_sans_alcool: userData.objectif_jours_sans_alcool,
              objectifs_personnels: userData.objectifs_personnels,
              start_date: userData.start_date,
            }}
          />
        )}

        {/* Bénéfices santé */}
        {userData && (
          <HealthStats
            days={Math.floor(
              (Date.now() - new Date(userData.start_date).getTime()) / (1000 * 60 * 60 * 24)
            )}
          />
        )}

        {/* Actions rapides */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            className="h-24 flex flex-col gap-2 w-full max-w-xs"
            onClick={() => navigate("/badges")}
          >
            <Award className="h-6 w-6" />
            <span>Mes Badges</span>
          </Button>
        </div>

        {/* Section moment difficile */}
        {userData && (
          <Card className="p-4 bg-muted/30">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-center mb-3">
                Moment difficile ?
              </p>
              <RelapseButton
                userId={userData.user_id}
                onReset={fetchUserData}
              />
            </div>
          </Card>
        )}

        {/* Developer Tools */}
        <Card className="p-4 border-dashed">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Outils de développement</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Réinitialiser le parcours
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Réinitialiser le parcours ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action supprimera vos données d'onboarding et vous devrez refaire le questionnaire. Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetOnboarding}>
                    Réinitialiser
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Désactiver mon compte
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer définitivement votre compte ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est <strong>définitive</strong> et supprimera toutes vos données (profil, posts, badges, statistiques). Cette action ne peut pas être annulée.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Supprimer mon compte
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Profile;
