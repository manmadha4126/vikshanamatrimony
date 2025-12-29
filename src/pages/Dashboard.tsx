import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ProfileSidebar from '@/components/dashboard/ProfileSidebar';
import AccountTypeSection from '@/components/dashboard/AccountTypeSection';
import ProfileCompletionSection from '@/components/dashboard/ProfileCompletionSection';
import DailyRecommendations from '@/components/dashboard/DailyRecommendations';
import AssistedServiceSection from '@/components/dashboard/AssistedServiceSection';
import Footer from '@/components/Footer';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading, signOut, refreshProfile, isAuthenticated } = useAuth();

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

  if (!user) {
    return null;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Profile Not Found</h2>
          <p className="text-muted-foreground">Please complete your registration first.</p>
          <button 
            onClick={() => navigate('/register')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Complete Registration
          </button>
        </div>
      </div>
    );
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
          <main className="flex-1 min-w-0 pb-12 space-y-6">
            <AccountTypeSection
              isPrime={profile.is_prime || false}
              primeExpiresAt={null}
            />

            <ProfileCompletionSection
              profile={{
                id: profile.id,
                phone: profile.phone,
                phone_verified: profile.phone_verified,
                about_me: profile.about_me,
                hobbies: profile.hobbies,
                horoscope_url: profile.horoscope_url,
                profile_completion_percentage: profile.profile_completion_percentage,
              }}
              onProfileUpdate={refreshProfile}
            />

            <DailyRecommendations
              userGender={profile.gender}
              userId={user.id}
            />

            <AssistedServiceSection />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
