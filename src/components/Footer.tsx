import dopaLogo from "@/assets/dopa-logo.png";

export const Footer = () => {
  return (
    <footer className="w-full py-8 mt-16 border-t border-border bg-card">
      <div className="container mx-auto px-4 flex justify-center">
        <img 
          src={dopaLogo} 
          alt="DOPA Logo" 
          className="h-12 w-auto opacity-80 hover:opacity-100 transition-opacity"
        />
      </div>
    </footer>
  );
};
