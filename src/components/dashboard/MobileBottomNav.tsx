import { Home, Heart, Gem, MessageCircle, Search, User } from 'lucide-react';

type DashboardView = 'home' | 'preferences' | 'search' | 'edit-profile' | 'view-profile' | 'interests' | 'messages' | 'notifications' | 'matches' | 'who-viewed-me';

interface MobileBottomNavProps {
  activeView: DashboardView;
  onNavigate: (view: DashboardView) => void;
}

const MobileBottomNav = ({ activeView, onNavigate }: MobileBottomNavProps) => {
  const navItems = [
    { view: 'home' as DashboardView, icon: Home, label: 'Home' },
    { view: 'interests' as DashboardView, icon: Heart, label: 'Interests' },
    { view: 'matches' as DashboardView, icon: Gem, label: 'Matches' },
    { view: 'messages' as DashboardView, icon: MessageCircle, label: 'Messages' },
    { view: 'view-profile' as DashboardView, icon: User, label: 'Profile' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = activeView === item.view || 
            (item.view === 'view-profile' && (activeView === 'edit-profile' || activeView === 'preferences'));
          
          return (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all duration-200 ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                isActive ? 'bg-primary/10 scale-110' : ''
              }`}>
                <item.icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
