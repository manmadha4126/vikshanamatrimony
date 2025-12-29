import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  Heart,
  Gem,
  MessageCircle,
  Search,
  Bell,
  User,
  Edit,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface DashboardHeaderProps {
  profile: {
    name: string;
    photo_url: string | null;
    profile_id: string | null;
  } | null;
  notificationCount?: number;
  onSignOut: () => void;
  onSearchClick?: () => void;
  onPreferencesClick?: () => void;
  onEditProfileClick?: () => void;
  onViewProfileClick?: () => void;
  onHomeClick?: () => void;
  onInterestsClick?: () => void;
  onMessagesClick?: () => void;
  onNotificationsClick?: () => void;
  onMatchesClick?: () => void;
}

const DashboardHeader = ({ 
  profile, 
  notificationCount = 0, 
  onSignOut,
  onSearchClick,
  onPreferencesClick,
  onEditProfileClick,
  onViewProfileClick,
  onHomeClick,
  onInterestsClick,
  onMessagesClick,
  onNotificationsClick,
  onMatchesClick,
}: DashboardHeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { icon: Home, label: 'Home', action: onHomeClick },
    { icon: Heart, label: 'Interests', action: onInterestsClick },
    { icon: Gem, label: 'Matches', action: onMatchesClick },
    { icon: MessageCircle, label: 'Messages', action: onMessagesClick },
    { icon: Search, label: 'Search', action: onSearchClick },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/my-dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-lg">V</span>
            </div>
            <span className="font-display font-bold text-xl hidden sm:block">
              <span className="bg-gradient-to-r from-primary via-primary/80 to-amber-500 bg-clip-text text-transparent">
                Vikshana
              </span>
              <span className="text-foreground ml-1">Matrimony</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Button 
                key={item.label} 
                variant="ghost" 
                size="sm" 
                className="gap-2"
                onClick={item.action}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative" onClick={onNotificationsClick}>
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive text-destructive-foreground"
                >
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Badge>
              )}
            </Button>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.photo_url || undefined} alt={profile?.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {profile?.name ? getInitials(profile.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium truncate max-w-[100px]">
                    {profile?.name?.split(' ')[0] || 'User'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{profile?.name}</p>
                  <p className="text-xs text-muted-foreground">{profile?.profile_id}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onViewProfileClick}>
                  <User className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEditProfileClick}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onPreferencesClick}>
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Preferences
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Shield className="mr-2 h-4 w-4" />
                  Verify Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Button 
                  key={item.label} 
                  variant="ghost" 
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    item.action?.();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default DashboardHeader;
