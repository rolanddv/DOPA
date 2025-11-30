import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface UserAvatarProps {
  username: string | null;
  avatarUrl: string | null;
  size?: "sm" | "md" | "lg";
}

const UserAvatar = ({ username, avatarUrl, size = "md" }: UserAvatarProps) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-8 w-8",
  };

  return (
    <Avatar className={sizeClasses[size]}>
      <AvatarImage src={avatarUrl || ""} alt={username || "Utilisateur"} />
      <AvatarFallback className="bg-primary/20 text-primary">
        {username ? (
          username.charAt(0).toUpperCase()
        ) : (
          <User className={iconSizes[size]} />
        )}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
