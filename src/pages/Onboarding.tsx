import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const onboardingSchema = z.object({
  first_name: z.string().trim().min(1, "⚠️ Le prénom est obligatoire"),
  last_name: z.string().trim().min(1, "⚠️ Le nom est obligatoire"),
  username: z.string().optional(),
  age: z.number({
    required_error: "⚠️ L'âge est obligatoire",
    invalid_type_error: "⚠️ L'âge doit être un nombre"
  }).min(13, "⚠️ Vous devez avoir au moins 13 ans").max(99, "⚠️ L'âge doit être au maximum 99 ans"),
  taille_cm: z.number({
    required_error: "⚠️ La taille est obligatoire",
    invalid_type_error: "⚠️ La taille doit être un nombre"
  }).min(100, "⚠️ La taille doit être au moins 100 cm").max(230, "⚠️ La taille doit être au maximum 230 cm"),
  poids_actuel_kg: z.number({
    required_error: "⚠️ Le poids est obligatoire",
    invalid_type_error: "⚠️ Le poids doit être un nombre"
  }).min(30, "⚠️ Le poids doit être au moins 30 kg").max(250, "⚠️ Le poids doit être au maximum 250 kg"),
  sexe: z.enum(["Homme", "Femme", "Autre"], {
    required_error: "⚠️ Veuillez sélectionner votre sexe"
  }),
  alcool_types: z.array(z.string()).min(1, "⚠️ Sélectionnez au moins un type d'alcool"),
  alcool_frequence: z.string().min(1, "⚠️ Sélectionnez une fréquence de consommation"),
  budget_alcool_hebdo_eur: z.number({
    required_error: "⚠️ Le budget est obligatoire",
    invalid_type_error: "⚠️ Le budget doit être un nombre"
  }).min(0, "⚠️ Le budget doit être positif ou zéro"),
  sommeil_base: z.number().min(1).max(5),
  energie_base: z.number().min(1).max(5),
  frequence_cardiaque_repos: z.union([
    z.number().min(30, "⚠️ La fréquence cardiaque doit être au moins 30 bpm").max(200, "⚠️ La fréquence cardiaque doit être au maximum 200 bpm"),
    z.nan(),
    z.undefined()
  ]).optional(),
  stress_base: z.number().min(1).max(5),
  objectif_jours_sans_alcool: z.number({
    required_error: "⚠️ Sélectionnez un objectif de jours"
  }),
  objectifs_personnels: z.array(z.string()).min(1, "⚠️ Sélectionnez au moins un objectif personnel"),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const alcoholTypeOptions = [
  { id: "Bière", label: "Bière" },
  { id: "Vin", label: "Vin" },
  { id: "Champagne", label: "Champagne" },
  { id: "Spiritueux", label: "Spiritueux" },
  { id: "Cocktails", label: "Cocktails" },
];

const frequencyOptions = [
  { value: "1–2 verres / semaine", label: "1–2 verres / semaine" },
  { value: "3–6 verres / semaine", label: "3–6 verres / semaine" },
  { value: "1 verre / jour", label: "1 verre / jour" },
  { value: "2–3 verres / jour", label: "2–3 verres / jour" },
  { value: "Plus de 3 verres / jour", label: "Plus de 3 verres / jour" },
];

const targetDaysOptions = [30, 60, 90, 180, 365];

const goalOptions = [
  { id: "Perte de poids", label: "Perte de poids" },
  { id: "Sommeil", label: "Sommeil" },
  { id: "Économies", label: "Économies" },
  { id: "Santé cardio", label: "Santé cardio" },
  { id: "Productivité", label: "Productivité" },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [existingProfile, setExistingProfile] = useState<{ 
    username: string | null;
    first_name: string | null;
    last_name: string | null;
  } | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setHasOnboarded, checkOnboardingStatus } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      age: 30,
      taille_cm: 170,
      poids_actuel_kg: 70,
      sexe: "Autre" as "Homme" | "Femme" | "Autre",
      alcool_types: [],
      objectifs_personnels: [],
      sommeil_base: 3,
      energie_base: 3,
      stress_base: 3,
      objectif_jours_sans_alcool: 90,
      alcool_frequence: "1–2 verres / semaine",
      budget_alcool_hebdo_eur: 0,
    },
  });

  useEffect(() => {
    const fetchExistingProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("username, first_name, last_name")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        setExistingProfile(profile);
        // Pré-remplir les champs pour un utilisateur revenant
        if (profile.first_name) setValue("first_name", profile.first_name);
        if (profile.last_name) setValue("last_name", profile.last_name);
        if (profile.username) setValue("username", profile.username);
      }
    };

    fetchExistingProfile();
  }, [setValue]);

  const alcool_types = watch("alcool_types") || [];
  const objectifs_personnels = watch("objectifs_personnels") || [];
  const sommeil_base = watch("sommeil_base");
  const energie_base = watch("energie_base");
  const stress_base = watch("stress_base");

  const toggleAlcoholType = (type: string) => {
    const current = alcool_types;
    if (current.includes(type)) {
      setValue("alcool_types", current.filter((t) => t !== type));
    } else {
      setValue("alcool_types", [...current, type]);
    }
  };

  const toggleGoal = (goal: string) => {
    const current = objectifs_personnels;
    if (current.includes(goal)) {
      setValue("objectifs_personnels", current.filter((g) => g !== goal));
    } else {
      setValue("objectifs_personnels", [...current, goal]);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };


  const onError = (errors: any) => {
    console.error("Form validation errors:", errors);
    
    // Compter le nombre d'erreurs
    const errorCount = Object.keys(errors).length;
    const errorMessages = Object.values(errors).map((error: any) => error.message).join(", ");
    
    toast({
      title: `❌ ${errorCount} erreur${errorCount > 1 ? 's' : ''} de validation`,
      description: "Veuillez corriger les champs signalés en rouge avant de continuer.",
      variant: "destructive",
    });
  };

  const onSubmit = async (data: OnboardingFormData) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour continuer.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      let avatarUrl = null;

      // Upload avatar if selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);

        if (uploadError) {
          console.error("Avatar upload error:", uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
          avatarUrl = publicUrl;
        }
      }

      // Insert user data with all fields from form
      const { error } = await supabase.from("user_data").insert({
        user_id: user.id,
        age: data.age,
        sexe: data.sexe,
        taille_cm: data.taille_cm,
        poids_actuel_kg: data.poids_actuel_kg,
        alcool_types: data.alcool_types,
        alcool_frequence: data.alcool_frequence,
        budget_alcool_hebdo_eur: data.budget_alcool_hebdo_eur,
        sommeil_base: data.sommeil_base,
        energie_base: data.energie_base,
        frequence_cardiaque_repos: data.frequence_cardiaque_repos,
        stress_base: data.stress_base,
        objectif_jours_sans_alcool: data.objectif_jours_sans_alcool,
        objectifs_personnels: data.objectifs_personnels,
        start_date: new Date().toISOString(),
      });

      if (error) throw error;

      // Update profile entry (created by trigger)
      // Si l'utilisateur existe déjà, conserver ses anciennes valeurs de nom/prénom/pseudo
      const profileUpdate: any = {
        user_id: user.id,
        avatar_url: avatarUrl,
      };

      if (!existingProfile?.first_name && !existingProfile?.last_name) {
        // Nouveau user: on peut définir tout
        profileUpdate.first_name = data.first_name;
        profileUpdate.last_name = data.last_name;
        profileUpdate.username = data.username || null;
      }
      // Si existingProfile a déjà des données, on ne touche PAS aux champs first_name, last_name, username

      await supabase.from("profiles").upsert(profileUpdate, { onConflict: 'user_id' });

      // Marquer l'onboarding comme terminé
      setHasOnboarded(true);

      toast({
        title: "Profil créé !",
        description: "Bienvenue dans votre parcours DOPA.",
      });

      navigate("/feed");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const nextStep = async () => {
    let fieldsToValidate: (keyof OnboardingFormData)[] = [];
    
    if (step === 1) {
      fieldsToValidate = ['first_name', 'last_name', 'sexe', 'age', 'taille_cm', 'poids_actuel_kg'];
    } else if (step === 2) {
      fieldsToValidate = ['alcool_types', 'alcool_frequence', 'budget_alcool_hebdo_eur'];
    } else if (step === 3) {
      fieldsToValidate = ['sommeil_base', 'energie_base', 'stress_base'];
      // frequence_cardiaque_repos est optionnel, ne pas le valider
    } else if (step === 4) {
      fieldsToValidate = ['objectif_jours_sans_alcool', 'objectifs_personnels'];
    }
    
    const isValid = await trigger(fieldsToValidate);
    if (!isValid) {
      toast({
        title: "⚠️ Champs obligatoires manquants",
        description: "Veuillez remplir tous les champs obligatoires avant de continuer.",
        variant: "destructive",
      });
    } else {
      setStep((s) => Math.min(s + 1, 5));
    }
  };
  
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-foreground">Bienvenue sur DOPA</h1>
            <span className="text-sm text-muted-foreground">Étape {step}/5</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
          {/* Étape 1: Informations personnelles */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Faisons connaissance
              </h2>

              {existingProfile && (existingProfile.first_name || existingProfile.last_name) && (
                <div className="p-3 bg-muted/50 border border-border rounded-lg mb-4">
                  <p className="text-sm text-muted-foreground">
                    ℹ️ Ces informations ne peuvent pas être modifiées lors d'une réinitialisation du parcours.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Prénom *</Label>
                  <Input
                    id="first_name"
                    type="text"
                    {...register("first_name")}
                    placeholder="Jean"
                    disabled={!!(existingProfile?.first_name || existingProfile?.last_name)}
                    className={`${errors.first_name ? "border-destructive" : ""} ${(existingProfile?.first_name || existingProfile?.last_name) ? "bg-muted/50 cursor-not-allowed" : ""}`}
                  />
                  {errors.first_name && (
                    <p className="text-sm text-destructive">{errors.first_name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Nom *</Label>
                  <Input
                    id="last_name"
                    type="text"
                    {...register("last_name")}
                    placeholder="Dupont"
                    disabled={!!(existingProfile?.first_name || existingProfile?.last_name)}
                    className={`${errors.last_name ? "border-destructive" : ""} ${(existingProfile?.first_name || existingProfile?.last_name) ? "bg-muted/50 cursor-not-allowed" : ""}`}
                  />
                  {errors.last_name && (
                    <p className="text-sm text-destructive">{errors.last_name.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-muted-foreground">
                  Pseudo - <span className="italic">optionnel</span>
                </Label>
                <Input
                  id="username"
                  type="text"
                  {...register("username")}
                  placeholder={existingProfile ? (existingProfile.username || "Non défini") : "ton_pseudo"}
                  disabled={!!(existingProfile?.first_name || existingProfile?.last_name)}
                  className={(existingProfile?.first_name || existingProfile?.last_name) ? "bg-muted/50 cursor-not-allowed" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label>Sexe *</Label>
                <div className="flex gap-4">
                  {["Homme", "Femme", "Autre"].map((option) => (
                    <label
                      key={option}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        value={option}
                        {...register("sexe")}
                        className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                      />
                      <span className="text-sm">{option}</span>
                    </label>
                  ))}
                </div>
                {errors.sexe && (
                  <p className="text-sm text-destructive">{errors.sexe.message}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Âge *</Label>
                  <Input
                    id="age"
                    type="number"
                    {...register("age", { valueAsNumber: true })}
                    placeholder="30"
                    min="13"
                    max="99"
                    className={errors.age ? "border-destructive" : ""}
                  />
                  {errors.age && (
                    <p className="text-sm text-destructive">{errors.age.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taille_cm">Taille (cm) *</Label>
                  <Input
                    id="taille_cm"
                    type="number"
                    {...register("taille_cm", { valueAsNumber: true })}
                    placeholder="175"
                    min="100"
                    max="230"
                    className={errors.taille_cm ? "border-destructive" : ""}
                  />
                  {errors.taille_cm && (
                    <p className="text-sm text-destructive">{errors.taille_cm.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="poids_actuel_kg">Poids (kg) *</Label>
                  <Input
                    id="poids_actuel_kg"
                    type="number"
                    {...register("poids_actuel_kg", { valueAsNumber: true })}
                    placeholder="75"
                    min="30"
                    max="250"
                    step="0.1"
                    className={errors.poids_actuel_kg ? "border-destructive" : ""}
                  />
                  {errors.poids_actuel_kg && (
                    <p className="text-sm text-destructive">{errors.poids_actuel_kg.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Étape 2: Habitudes de consommation */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Vos habitudes avant la maîtrise
              </h2>

              <div>
                <Label className="mb-3 block">Types d'alcool consommés *</Label>
                <div className={`grid grid-cols-2 gap-3 ${errors.alcool_types ? "border-2 border-destructive rounded-lg p-3" : ""}`}>
                  {alcoholTypeOptions.map((option) => (
                    <div
                      key={option.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        alcool_types.includes(option.id)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => toggleAlcoholType(option.id)}
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={alcool_types.includes(option.id)}
                          onChange={() => toggleAlcoholType(option.id)}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <Label className="cursor-pointer font-normal">{option.label}</Label>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.alcool_types && (
                  <p className="text-sm text-destructive mt-2">{errors.alcool_types.message}</p>
                )}
              </div>

              <div>
                <Label className="mb-3 block">Fréquence de consommation moyenne *</Label>
                <div className={`space-y-2 ${errors.alcool_frequence ? "border-2 border-destructive rounded-lg p-3" : ""}`}>
                  {frequencyOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer"
                    >
                      <input
                        type="radio"
                        value={option.value}
                        {...register("alcool_frequence")}
                        className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                      />
                      <span className="text-sm flex-1">{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors.alcool_frequence && (
                  <p className="text-sm text-destructive mt-2">
                    {errors.alcool_frequence.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="budget_alcool_hebdo_eur">Budget hebdomadaire moyen (€) *</Label>
                <Input
                  id="budget_alcool_hebdo_eur"
                  type="number"
                  {...register("budget_alcool_hebdo_eur", { valueAsNumber: true })}
                  placeholder="Ex: 50"
                  className={errors.budget_alcool_hebdo_eur ? "border-destructive" : ""}
                />
                {errors.budget_alcool_hebdo_eur && (
                  <p className="text-sm text-destructive mt-1">{errors.budget_alcool_hebdo_eur.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Étape 3: État de santé */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Votre état de santé actuel
              </h2>

              <div>
                <Label className="mb-2 block">
                  Qualité du sommeil actuelle: {sommeil_base}/5
                </Label>
                <Slider
                  value={[sommeil_base]}
                  onValueChange={([value]) => setValue("sommeil_base", value)}
                  min={1}
                  max={5}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Très mauvais</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Niveau d'énergie actuel: {energie_base}/5</Label>
                <Slider
                  value={[energie_base]}
                  onValueChange={([value]) => setValue("energie_base", value)}
                  min={1}
                  max={5}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Très faible</span>
                  <span>Très élevé</span>
                </div>
              </div>

              <div>
                <Label htmlFor="frequence_cardiaque_repos" className="text-muted-foreground">
                  Fréquence cardiaque au repos (bpm) - <span className="italic">optionnel</span>
                </Label>
                <Input
                  id="frequence_cardiaque_repos"
                  type="number"
                  {...register("frequence_cardiaque_repos", { 
                    valueAsNumber: true,
                    setValueAs: (v) => v === "" || isNaN(v) ? undefined : Number(v)
                  })}
                  placeholder="Ex: 70"
                />
                {errors.frequence_cardiaque_repos && (
                  <p className="text-sm text-destructive mt-1">{errors.frequence_cardiaque_repos.message}</p>
                )}
              </div>

              <div>
                <Label className="mb-2 block">Niveau de stress actuel: {stress_base}/5</Label>
                <Slider
                  value={[stress_base]}
                  onValueChange={([value]) => setValue("stress_base", value)}
                  min={1}
                  max={5}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Très faible</span>
                  <span>Très élevé</span>
                </div>
              </div>
            </div>
          )}

          {/* Étape 4: Objectifs */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-semibold text-foreground mb-4">Vos objectifs</h2>

              <div>
                <Label className="mb-3 block">Objectif de jours sans alcool *</Label>
                <div className={`grid grid-cols-5 gap-2 ${errors.objectif_jours_sans_alcool ? "border-2 border-destructive rounded-lg p-3" : ""}`}>
                  {targetDaysOptions.map((days) => (
                    <Button
                      key={days}
                      type="button"
                      variant={watch("objectif_jours_sans_alcool") === days ? "default" : "outline"}
                      onClick={() => setValue("objectif_jours_sans_alcool", days)}
                      className="h-16"
                    >
                      <div className="text-center">
                        <div className="font-bold">{days}</div>
                        <div className="text-xs">jours</div>
                      </div>
                    </Button>
                  ))}
                </div>
                {errors.objectif_jours_sans_alcool && (
                  <p className="text-sm text-destructive mt-2">{errors.objectif_jours_sans_alcool.message}</p>
                )}
              </div>

              <div>
                <Label className="mb-3 block">Objectifs personnels *</Label>
                <div className={`space-y-3 ${errors.objectifs_personnels ? "border-2 border-destructive rounded-lg p-3" : ""}`}>
                  {goalOptions.map((option) => (
                    <div
                      key={option.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        objectifs_personnels.includes(option.id)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => toggleGoal(option.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={objectifs_personnels.includes(option.id)}
                          onChange={() => toggleGoal(option.id)}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <Label className="cursor-pointer font-normal">{option.label}</Label>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.objectifs_personnels && (
                  <p className="text-sm text-destructive mt-2">{errors.objectifs_personnels.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Étape 5: Photo de profil */}
          {step === 5 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Photo de profil (optionnel)
              </h2>

              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={avatarPreview} />
                    <AvatarFallback className="bg-primary/20 text-primary text-4xl">
                      <User className="h-16 w-16" />
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 h-10 w-10 rounded-full shadow-lg"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-5 w-5" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>

                <p className="text-sm text-muted-foreground text-center max-w-md">
                  Ajoutez une photo pour personnaliser votre profil. Vous pourrez la modifier plus tard.
                </p>
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-6 border-t">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                Précédent
              </Button>
            )}
            {step < 5 ? (
              <Button type="button" onClick={nextStep} className="ml-auto">
                Suivant
              </Button>
            ) : (
              <Button type="submit" className="ml-auto">
                PASSER À L'ACTION
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
