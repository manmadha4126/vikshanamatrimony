import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ProfileSidebar from '@/components/dashboard/ProfileSidebar';
import PartnerPreferencesSection from '@/components/dashboard/PartnerPreferencesSection';
import Footer from '@/components/Footer';

const Preferences = () => {
  const navigate = useNavigate();
  const { user, profile, loading, signOut, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        profile={profile}
        notificationCount={0}
        onSignOut={handleSignOut}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Profile */}
          <div className="hidden lg:block flex-shrink-0">
            <ProfileSidebar
              profile={{
                name: profile.name,
                photo_url: profile.photo_url,
                profile_id: profile.profile_id,
                is_prime: profile.is_prime || false,
                verification_status: profile.verification_status,
              }}
              onSignOut={handleSignOut}
            />
          </div>

          {/* Main Content */}
          <main className="flex-1 min-w-0 pb-12">
            <PartnerPreferencesSection userId={user.id} />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Preferences;
