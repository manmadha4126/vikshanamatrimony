import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import AccountTypeSection from '@/components/dashboard/AccountTypeSection';
import ProfileCompletionSection from '@/components/dashboard/ProfileCompletionSection';
import PartnerPreferencesSection from '@/components/dashboard/PartnerPreferencesSection';
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

      <main className="pb-12">
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

        <PartnerPreferencesSection userId={user.id} />

        <DailyRecommendations
          userGender={profile.gender}
          userId={user.id}
        />

        <AssistedServiceSection />
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
