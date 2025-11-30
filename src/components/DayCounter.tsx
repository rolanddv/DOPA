import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DayCounterProps {
  startDate?: Date;
  onReset?: () => void;
  firstName?: string;
  gender?: "Homme" | "Femme" | "Autre";
}

interface TimeUnits {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const DayCounter = ({ startDate, onReset, firstName, gender }: DayCounterProps) => {
  const [time, setTime] = useState<TimeUnits>({
    years: 0,
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      if (!startDate) {
        setTime({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const now = new Date();
      const start = new Date(startDate);
      
      // Calculer la différence totale en millisecondes
      let diff = now.getTime() - start.getTime();
      
      // Calculer les années
      const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
      diff -= years * (1000 * 60 * 60 * 24 * 365);
      
      // Calculer les mois (approximativement 30 jours)
      const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
      diff -= months * (1000 * 60 * 60 * 24 * 30);
      
      // Calculer les jours
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      diff -= days * (1000 * 60 * 60 * 24);
      
      // Calculer les heures
      const hours = Math.floor(diff / (1000 * 60 * 60));
      diff -= hours * (1000 * 60 * 60);
      
      // Calculer les minutes
      const minutes = Math.floor(diff / (1000 * 60));
      diff -= minutes * (1000 * 60);
      
      // Calculer les secondes
      const seconds = Math.floor(diff / 1000);

      setTime({ years, months, days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000); // Update every second

    return () => clearInterval(interval);
  }, [startDate]);

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-[var(--shadow-soft)] animate-fade-in">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
      <div className="relative p-6 md:p-10 text-center">
        <h2 className="text-xl md:text-2xl font-medium mb-6 opacity-90">
          {gender === "Homme" ? "Le nouveau" : gender === "Femme" ? "La nouvelle" : "Le nouveau"} {firstName || "champion"} depuis :
        </h2>
        
        <div className="mb-6">
          {/* Grille de chronomètre - affichage conditionnel */}
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-4xl mx-auto">
            {/* Années - afficher seulement si >= 1 */}
            {time.years >= 1 && (
              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-3 md:p-4 min-w-[80px] md:min-w-[100px]">
                <div className="text-3xl md:text-5xl font-bold mb-1 animate-scale-in">
                  {String(time.years).padStart(2, '0')}
                </div>
                <div className="text-xs md:text-sm opacity-80">
                  {time.years <= 1 ? "Année" : "Années"}
                </div>
              </div>
            )}

            {/* Mois - afficher seulement si >= 1 ou si années >= 1 */}
            {(time.months >= 1 || time.years >= 1) && (
              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-3 md:p-4 min-w-[80px] md:min-w-[100px]">
                <div className="text-3xl md:text-5xl font-bold mb-1 animate-scale-in">
                  {String(time.months).padStart(2, '0')}
                </div>
                <div className="text-xs md:text-sm opacity-80">
                  Mois
                </div>
              </div>
            )}

            {/* Jours - afficher seulement si >= 1 ou si mois >= 1 */}
            {(time.days >= 1 || time.months >= 1 || time.years >= 1) && (
              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-3 md:p-4 min-w-[80px] md:min-w-[100px]">
                <div className="text-3xl md:text-5xl font-bold mb-1 animate-scale-in">
                  {String(time.days).padStart(2, '0')}
                </div>
                <div className="text-xs md:text-sm opacity-80">
                  {time.days <= 1 ? "Jour" : "Jours"}
                </div>
              </div>
            )}

            {/* Heures - afficher seulement si >= 1 ou si jours >= 1 */}
            {(time.hours >= 1 || time.days >= 1 || time.months >= 1 || time.years >= 1) && (
              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-3 md:p-4 min-w-[80px] md:min-w-[100px]">
                <div className="text-3xl md:text-5xl font-bold mb-1">
                  {String(time.hours).padStart(2, '0')}
                </div>
                <div className="text-xs md:text-sm opacity-80">
                  {time.hours <= 1 ? "Heure" : "Heures"}
                </div>
              </div>
            )}

            {/* Minutes - afficher seulement si >= 1 ou si heures >= 1 */}
            {(time.minutes >= 1 || time.hours >= 1 || time.days >= 1 || time.months >= 1 || time.years >= 1) && (
              <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-3 md:p-4 min-w-[80px] md:min-w-[100px]">
                <div className="text-3xl md:text-5xl font-bold mb-1">
                  {String(time.minutes).padStart(2, '0')}
                </div>
                <div className="text-xs md:text-sm opacity-80">
                  {time.minutes <= 1 ? "Min" : "Mins"}
                </div>
              </div>
            )}

            {/* Secondes - toujours afficher */}
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-3 md:p-4 min-w-[80px] md:min-w-[100px]">
              <div className="text-3xl md:text-5xl font-bold mb-1 tabular-nums">
                {String(time.seconds).padStart(2, '0')}
              </div>
              <div className="text-xs md:text-sm opacity-80">
                {time.seconds <= 1 ? "Sec" : "Secs"}
              </div>
            </div>
          </div>
        </div>

        {startDate && (
          <Button
            variant="secondary"
            onClick={onReset}
            className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-0"
          >
            Réinitialiser le compteur
          </Button>
        )}

        {!startDate && (
          <p className="text-lg opacity-80">
            Commence ton parcours dès maintenant
          </p>
        )}
      </div>
    </Card>
  );
};
