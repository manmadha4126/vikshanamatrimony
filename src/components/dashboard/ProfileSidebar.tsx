import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Camera, Edit, Settings, Crown, User, LogOut, BadgeCheck, Home, Eye, Heart, MessageCircle, Bell, Gem, Users } from 'lucide-react';

type DashboardView = 'home' | 'preferences' | 'search' | 'edit-profile' | 'view-profile' | 'interests' | 'messages' | 'notifications' | 'matches' | 'who-viewed-me';

interface ProfileSidebarProps {
  profile: {
    name: string;
    photo_url: string | null;
    profile_id: string | null;
    is_prime?: boolean;
    verification_status?: string | null;
  };
  onSignOut: () => void;
  onPreferencesClick?: () => void;
  onEditProfileClick?: () => void;
  onViewProfileClick?: () => void;
  onHomeClick?: () => void;
  onInterestsClick?: () => void;
  onMessagesClick?: () => void;
  onNotificationsClick?: () => void;
  onMatchesClick?: () => void;
  onWhoViewedMeClick?: () => void;
  activeView?: DashboardView;
}

const ProfileSidebar = ({ profile, onSignOut, onPreferencesClick, onEditProfileClick, onViewProfileClick, onHomeClick, onInterestsClick, onMessagesClick, onNotificationsClick, onMatchesClick, onWhoViewedMeClick, activeView = 'home' }: ProfileSidebarProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isVerified = profile.verification_status === 'verified';

  return (
    <aside className="w-72 bg-card rounded-2xl shadow-lg border border-border h-[calc(100vh-6rem)] sticky top-20 flex flex-col">
      <ScrollArea className="flex-1 p-6">
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

          {/* User Name with Verification Badge */}
          <div className="mt-4 flex items-center gap-1.5">
            <h3 className="text-xl font-semibold text-foreground">{profile.name}</h3>
            {isVerified ? (
              <BadgeCheck className="h-5 w-5 text-green-600 fill-green-100" />
            ) : (
              <BadgeCheck className="h-5 w-5 text-red-500 fill-red-100" />
            )}
          </div>

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

        {/* Dashboard Home */}
        <button 
          onClick={onHomeClick}
          className={`w-full flex items-center gap-3 py-3 px-2 hover:bg-muted/50 rounded-lg transition-colors ${activeView === 'home' ? 'bg-muted' : ''}`}
        >
          <Home className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Dashboard</span>
        </button>

        {/* View Profile */}
        <button 
          onClick={onViewProfileClick}
          className={`w-full flex items-center gap-3 py-3 px-2 hover:bg-muted/50 rounded-lg transition-colors ${activeView === 'view-profile' ? 'bg-muted' : ''}`}
        >
          <Eye className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">View profile</span>
        </button>

        {/* Edit Profile */}
        <button 
          onClick={onEditProfileClick}
          className={`w-full flex items-center gap-3 py-3 px-2 hover:bg-muted/50 rounded-lg transition-colors ${activeView === 'edit-profile' ? 'bg-muted' : ''}`}
        >
          <Edit className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Edit profile</span>
        </button>

        {/* Edit Preferences */}
        <button 
          onClick={onPreferencesClick}
          className={`w-full flex items-center gap-3 py-3 px-2 hover:bg-muted/50 rounded-lg transition-colors ${activeView === 'preferences' ? 'bg-muted' : ''}`}
        >
          <Settings className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Edit preferences</span>
        </button>

        {/* Interests */}
        <button 
          onClick={onInterestsClick}
          className={`w-full flex items-center gap-3 py-3 px-2 hover:bg-muted/50 rounded-lg transition-colors ${activeView === 'interests' ? 'bg-muted' : ''}`}
        >
          <Heart className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Interests</span>
        </button>

        {/* Matches */}
        <button 
          onClick={onMatchesClick}
          className={`w-full flex items-center gap-3 py-3 px-2 hover:bg-muted/50 rounded-lg transition-colors ${activeView === 'matches' ? 'bg-muted' : ''}`}
        >
          <Gem className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Matches</span>
        </button>

        {/* Messages */}
        <button 
          onClick={onMessagesClick}
          className={`w-full flex items-center gap-3 py-3 px-2 hover:bg-muted/50 rounded-lg transition-colors ${activeView === 'messages' ? 'bg-muted' : ''}`}
        >
          <MessageCircle className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Messages</span>
        </button>

        {/* Who Viewed Me */}
        <button 
          onClick={onWhoViewedMeClick}
          className={`w-full flex items-center gap-3 py-3 px-2 hover:bg-muted/50 rounded-lg transition-colors ${activeView === 'who-viewed-me' ? 'bg-muted' : ''}`}
        >
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Who Viewed Me</span>
        </button>

        {/* Notifications */}
        <button 
          onClick={onNotificationsClick}
          className={`w-full flex items-center gap-3 py-3 px-2 hover:bg-muted/50 rounded-lg transition-colors ${activeView === 'notifications' ? 'bg-muted' : ''}`}
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Notifications</span>
        </button>

        {/* Log Out */}
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 py-3 px-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-sm font-medium">Log out</span>
        </button>
      </ScrollArea>
    </aside>
  );
};

export default ProfileSidebar;