import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import vikshanaLogo from '@/assets/vikshana-logo.png';
import { Input } from '@/components/ui/input';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import ProfileViewModal from './ProfileViewModal';

interface DashboardHeaderProps {
  profile: {
    name: string;
    photo_url: string | null;
    profile_id: string | null;
    is_prime?: boolean;
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

interface SearchResult {
  id: string;
  name: string;
  profile_id: string | null;
  photo_url: string | null;
  city: string | null;
  state: string | null;
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { icon: Home, label: 'Home', action: onHomeClick },
    { icon: Heart, label: 'Interests', action: onInterestsClick },
    { icon: Gem, label: 'Matches', action: onMatchesClick },
    { icon: MessageCircle, label: 'Messages', action: onMessagesClick },
    { icon: Search, label: 'Search', action: onPreferencesClick },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Enter a name",
        description: "Please enter a name to search for profiles.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, profile_id, photo_url, city, state')
        .ilike('name', `%${searchQuery.trim()}%`)
        .limit(10);

      if (error) throw error;

      setSearchResults(data || []);
      
      if (!data || data.length === 0) {
        toast({
          title: "No profiles found",
          description: `No profiles found matching "${searchQuery}"`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Search failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/my-dashboard" className="flex items-center gap-2">
            <img src={vikshanaLogo} alt="Vikshana Logo" className="w-10 h-10 object-contain" />
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg leading-tight">
                <span className="bg-gradient-to-r from-primary via-primary/80 to-amber-500 bg-clip-text text-transparent">
                  Vikshana
                </span>
                <span className="text-foreground ml-1">Matrimony</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wide hidden sm:block">
                Where Hearts Find Home
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
              <Button 
                key={item.label} 
                variant={item.label === 'Search' && isSearchOpen ? 'default' : 'ghost'}
                size="lg" 
                className="gap-2.5 text-foreground hover:bg-foreground/10 hover:text-foreground hover:scale-105 transition-all duration-200 font-medium px-5"
                onClick={item.action}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-base">{item.label}</span>
              </Button>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Notifications - Hidden on mobile since it's in bottom nav */}
            <Button variant="ghost" size="icon" className="relative hidden lg:flex" onClick={onNotificationsClick}>
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

            {/* Mobile Menu Toggle with Notification Indicator */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden relative"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              {notificationCount > 0 && !isMobileMenuOpen && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full animate-pulse" />
              )}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="py-3 border-t border-border animate-in slide-in-from-top-2 duration-200">
            <div className="flex gap-2 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search profiles by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10"
                  autoFocus
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
              <Button variant="ghost" size="icon" onClick={closeSearch}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-3 max-w-2xl mx-auto bg-card border border-border rounded-lg overflow-hidden">
                <div className="p-2 bg-muted/50 border-b border-border">
                  <p className="text-sm text-muted-foreground">{searchResults.length} profile(s) found</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors border-b border-border last:border-b-0"
                      onClick={() => {
                        setSelectedProfileId(result.id);
                        setIsProfileModalOpen(true);
                        closeSearch();
                      }}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={result.photo_url || undefined} alt={result.name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm">
                          {getInitials(result.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{result.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {result.profile_id} {result.city && result.state && `• ${result.city}, ${result.state}`}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Button 
                  key={item.label} 
                  variant="ghost" 
                  size="lg"
                  className="w-full justify-start gap-3 text-foreground hover:bg-foreground/10 hover:text-foreground hover:scale-[1.02] transition-all duration-200 font-medium"
                  onClick={() => {
                    item.action?.();
                    if (item.label !== 'Search') {
                      setIsMobileMenuOpen(false);
                    }
                  }}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-base">{item.label}</span>
                </Button>
              ))}
            </div>
          </nav>
        )}
      </div>

      {/* Profile View Modal */}
      <ProfileViewModal
        profileId={selectedProfileId}
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedProfileId(null);
        }}
        currentUserIsPrime={profile?.is_prime || false}
      />
    </header>
  );
};

export default DashboardHeader;
