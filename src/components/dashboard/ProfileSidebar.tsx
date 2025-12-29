import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Camera, Edit, Settings, Crown, ChevronDown } from 'lucide-react';

interface ProfileSidebarProps {
  profile: {
    name: string;
    photo_url: string | null;
    profile_id: string | null;
    is_prime?: boolean;
  };
}

const ProfileSidebar = ({ profile }: ProfileSidebarProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <aside className="w-72 bg-card rounded-2xl shadow-lg border border-border p-6 h-fit sticky top-20">
      {/* Profile Photo Section */}
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-primary/20">
            <AvatarImage src={profile.photo_url || undefined} alt={profile.name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
          <Button
            size="icon"
            variant="secondary"
            className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md"
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>

        {/* User Name */}
        <h3 className="mt-4 text-xl font-semibold text-foreground">{profile.name}</h3>

        {/* Brand Badge */}
        <div className="flex items-center gap-1.5 mt-1 text-sm text-primary">
          <div className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xs">V</span>
          </div>
          <span className="font-medium">Vikshana Matrimony</span>
        </div>

        {/* Profile ID */}
        <p className="mt-3 text-lg font-semibold text-foreground">{profile.profile_id || 'N/A'}</p>

        {/* Membership Status */}
        <Badge variant={profile.is_prime ? 'default' : 'secondary'} className="mt-1">
          {profile.is_prime ? 'Prime Member' : 'Free member'}
        </Badge>
      </div>

      {/* Upgrade Section (for non-prime users) */}
      {!profile.is_prime && (
        <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-xl border border-amber-200/50 dark:border-amber-800/50">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                Upgrade membership to call or message with matches
              </p>
              <Button
                size="sm"
                className="mt-3 bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Crown className="mr-1.5 h-4 w-4" />
                Upgrade now
              </Button>
            </div>
            <Crown className="h-10 w-10 text-amber-500 opacity-50" />
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="my-6 border-t border-border" />

      {/* Switch Account */}
      <button className="w-full flex items-center justify-between py-3 px-2 hover:bg-muted/50 rounded-lg transition-colors">
        <span className="text-sm font-medium text-foreground">Switch account</span>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
              V
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </button>

      {/* Edit Profile */}
      <Link to="/dashboard/edit-profile">
        <button className="w-full flex items-center gap-3 py-3 px-2 hover:bg-muted/50 rounded-lg transition-colors">
          <Edit className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Edit profile</span>
        </button>
      </Link>

      {/* Edit Preferences */}
      <Link to="/dashboard/preferences">
        <button className="w-full flex items-center gap-3 py-3 px-2 hover:bg-muted/50 rounded-lg transition-colors">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Edit preferences</span>
        </button>
      </Link>
    </aside>
  );
};

export default ProfileSidebar;
