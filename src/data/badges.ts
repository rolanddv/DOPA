export interface Badge {
  emoji: string;
  text: string;
  category: string;
  minDays?: number;
  villainName?: string;
}

export const badgeCategories = {
  quotidien: "Du Quotidien",
  occasions: "Grandes Occasions",
  sortie: "Société / Sortie",
  victoires: "Victoires Perso",
  autodérision: "Auto-dérision",
  partage: "Partage Social",
  parents: "Parents",
  sportifs: "Sportifs",
  mechants: "Méchants Vaincus",
};

export const badges: Badge[] = [
  // Badges du Quotidien
  { emoji: "☀️", text: "Premier week-end chill sans boire", category: "quotidien", minDays: 2 },
  { emoji: "🍕", text: "Apéro soft réussi", category: "quotidien" },
  { emoji: "📺", text: "Netflix & Eau pétillante", category: "quotidien" },
  { emoji: "💧", text: "Hydraté, pas éclaté", category: "quotidien" },
  { emoji: "😌", text: "Dormi 8h, miracle.", category: "quotidien" },
  { emoji: "🍳", text: "Premier brunch sans gueule de bois", category: "quotidien", minDays: 1 },
  { emoji: "🚲", text: "Matin productif – zéro regrets", category: "quotidien" },

  // Badges Grandes Occasions
  { emoji: "💒", text: "Premier mariage sans champagne", category: "occasions" },
  { emoji: "👩‍👩‍👦", text: "Dîner chez la belle-famille : sobre et digne", category: "occasions" },
  { emoji: "🎂", text: "Anniv sans excès – j'ai soufflé les bougies, pas les plombs", category: "occasions" },
  { emoji: "🎄", text: "Noël sans bulles (et sans drame)", category: "occasions" },
  { emoji: "🎆", text: "Nouvel An sobre – qui l'eût cru ?", category: "occasions" },

  // Badges Société / Sortie
  { emoji: "🎤", text: "Soirée karaoké 0%", category: "sortie" },
  { emoji: "🎧", text: "Premier festival sobre – et j'ai tout retenu !", category: "sortie" },
  { emoji: "🍻", text: "1ère soirée entre potes sans lever le coude", category: "sortie" },
  { emoji: "🍝", text: "Dîner arrosé... d'eau !", category: "sortie" },
  { emoji: "💃", text: "Dansé sans boire (et j'assume)", category: "sortie" },

  // Badges Victoires perso
  { emoji: "🧘", text: "Contrôle total, pas total contrôle", category: "victoires" },
  { emoji: "📅", text: "7 jours sans, easy.", category: "victoires", minDays: 7 },
  { emoji: "📆", text: "30 jours sans – le vrai glow-up.", category: "victoires", minDays: 30 },
  { emoji: "🏆", text: "Master of self-control", category: "victoires", minDays: 60 },
  { emoji: "🔥", text: "Sobre, mais chaud.", category: "victoires" },
  { emoji: "🧩", text: "Premier vendredi soir sans craquer.", category: "victoires" },

  // Badges Auto-dérision
  { emoji: "😎", text: "Toujours fun, même à jeun.", category: "autodérision" },
  { emoji: "🤓", text: "Overthinker sobre.", category: "autodérision" },
  { emoji: "🐢", text: "Lent mais lucide.", category: "autodérision" },
  { emoji: "🧃", text: "Mocktail hero.", category: "autodérision" },
  { emoji: "💅", text: "Sobre, mais stylé.", category: "autodérision" },
  { emoji: "💸", text: "Pochtron repenti, portefeuille content.", category: "autodérision" },

  // Badges Partage social / fierté
  { emoji: "🌈", text: "Sobre & fier.", category: "partage", minDays: 1 },
  { emoji: "🚀", text: "Jour X – let's go Dopa.", category: "partage" },
  { emoji: "🎯", text: "1 mois clean, 100 % dopamine naturelle.", category: "partage", minDays: 30 },
  { emoji: "💬", text: "Sobre ne veut pas dire chiant.", category: "partage" },
  { emoji: "📣", text: "Pas de morale, juste du contrôle.", category: "partage" },
  { emoji: "🏁", text: "Challenge Dopa validé ✅", category: "partage", minDays: 90 },

  // Badges Parents
  { emoji: "☀️", text: "J'ai géré le réveil de 6h (sobre et lucide)", category: "parents" },
  { emoji: "🍼", text: "Parent 1 – Gueule de bois 0.", category: "parents" },
  { emoji: "☕", text: "Premier matin sans mal de tête depuis que j'ai des enfants.", category: "parents" },
  { emoji: "🧃", text: "Biberon, café, fierté.", category: "parents" },
  { emoji: "🧸", text: "Sobre à 6h du mat — les vrais savent.", category: "parents" },
  { emoji: "🎠", text: "J'ai survécu à l'anniv d'un enfant sans boire.", category: "parents" },
  { emoji: "📚", text: "Devoirs du soir, cerveau encore connecté.", category: "parents" },
  { emoji: "🧺", text: "Lessive faite, morale intacte.", category: "parents" },
  { emoji: "🚗", text: "Sam pour le foot du petit – et fier.", category: "parents" },
  { emoji: "🌙", text: "Coucher les enfants, pas mes neurones.", category: "parents" },

  // Badges Sportifs
  { emoji: "🥇", text: "Un marathon, c'est plus facile sans gueule de bois.", category: "sportifs" },
  { emoji: "🚴", text: "J'ai remplacé les shots par les watts.", category: "sportifs" },
  { emoji: "🏋️", text: "Sobre, mais chargé à la dopamine.", category: "sportifs" },
  { emoji: "🏃", text: "Record perso battu – zéro alcool, 100 % Dopa.", category: "sportifs" },
  { emoji: "🎯", text: "Moins de bières, plus de PR.", category: "sportifs" },
  { emoji: "🧘", text: "Focus, pas flou.", category: "sportifs" },
  { emoji: "⏰", text: "Run du dimanche matin : validé.", category: "sportifs" },
  { emoji: "💪", text: "Mon afterwork, c'est la salle.", category: "sportifs" },
  { emoji: "🧊", text: "Ice bath > ice cubes.", category: "sportifs" },
  { emoji: "🔥", text: "Sobre, mais chaud.", category: "sportifs" },

  // Badges Méchants Vaincus
  { emoji: "🍾", text: "J'ai résisté à Jean-Michel Insistance – Le gars qui te ressert sans te demander.", category: "mechants", villainName: "Jean-Michel Insistance" },
  { emoji: "🍹", text: "J'ai résisté au Mauvais Barman – Il t'a mis du rhum alors que t'avais dit sans.", category: "mechants", villainName: "Le Mauvais Barman" },
  { emoji: "🍺", text: "J'ai résisté à Lionel IPA – Connaît toutes les bières artisanales, ne connaît pas le consentement liquide.", category: "mechants", villainName: "Lionel IPA" },
  { emoji: "🧊", text: "J'ai résisté au Bon Copain – Il veut juste 'retrouver le toi d'avant'.", category: "mechants", villainName: "Le Bon Copain" },
  { emoji: "🎉", text: "J'ai résisté à la Fêtarde Persuasive – T'as changéééé, allez un shooter !", category: "mechants", villainName: "La Fêtarde Persuasive" },
];
