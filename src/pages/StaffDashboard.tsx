import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

const StaffDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session?.user) {
          navigate("/staff-login");
        } else {
          setUser(session.user);
          // Defer Supabase call
          setTimeout(() => {
            checkRole(session.user.id);
          }, 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/staff-login");
      } else {
        setUser(session.user);
        checkRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkRole = async (userId: string) => {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (roles && roles.length > 0) {
      const hasAccess = roles.some(r => r.role === "admin" || r.role === "staff");
      if (hasAccess) {
        setUserRole(roles.find(r => r.role === "admin")?.role || roles[0].role);
      } else {
        navigate("/staff-login");
      }
    } else {
      navigate("/staff-login");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been signed out successfully.",
    });
    navigate("/staff-login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-white to-cream">
        <div className="animate-pulse text-maroon">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-maroon">Staff Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {user?.email} • <span className="capitalize font-medium">{userRole}</span>
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-maroon text-maroon hover:bg-maroon hover:text-white"
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats Card */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gold/20">
            <h3 className="text-lg font-semibold text-maroon mb-2">Total Registrations</h3>
            <p className="text-4xl font-bold text-foreground">0</p>
            <p className="text-sm text-muted-foreground mt-1">Coming soon</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gold/20">
            <h3 className="text-lg font-semibold text-maroon mb-2">Active Profiles</h3>
            <p className="text-4xl font-bold text-foreground">0</p>
            <p className="text-sm text-muted-foreground mt-1">Coming soon</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gold/20">
            <h3 className="text-lg font-semibold text-maroon mb-2">Pending Approvals</h3>
            <p className="text-4xl font-bold text-foreground">0</p>
            <p className="text-sm text-muted-foreground mt-1">Coming soon</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6 border border-gold/20">
          <h2 className="text-xl font-bold text-maroon mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Button className="bg-maroon hover:bg-maroon/90 text-white">
              Manage Profiles
            </Button>
            <Button variant="outline" className="border-gold text-foreground hover:bg-gold/10">
              View Reports
            </Button>
            <Button variant="outline" className="border-gold text-foreground hover:bg-gold/10">
              Settings
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;
