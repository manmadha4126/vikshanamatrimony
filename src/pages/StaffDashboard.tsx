import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Users, CheckCircle, Clock } from "lucide-react";

interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  profile_for: string | null;
  email_verified: boolean;
  created_at: string;
}

const StaffDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session?.user) {
          navigate("/staff-login");
        } else {
          setUser(session.user);
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
        fetchProfiles();
      } else {
        navigate("/staff-login");
      }
    } else {
      navigate("/staff-login");
    }
    setLoading(false);
  };

  const fetchProfiles = async () => {
    setLoadingProfiles(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, email, phone, gender, profile_for, email_verified, created_at")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error("Error fetching profiles:", error);
      toast({
        title: "Error",
        description: "Failed to load profiles",
        variant: "destructive",
      });
    } finally {
      setLoadingProfiles(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been signed out successfully.",
    });
    navigate("/staff-login");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-white to-cream">
        <div className="animate-pulse text-maroon">Loading dashboard...</div>
      </div>
    );
  }

  const totalRegistrations = profiles.length;
  const verifiedProfiles = profiles.filter(p => p.email_verified).length;
  const pendingVerification = profiles.filter(p => !p.email_verified).length;

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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gold/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Total Registrations</h3>
                <p className="text-3xl font-bold text-foreground">{totalRegistrations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gold/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Verified Profiles</h3>
                <p className="text-3xl font-bold text-foreground">{verifiedProfiles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gold/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Pending Verification</h3>
                <p className="text-3xl font-bold text-foreground">{pendingVerification}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profiles Table */}
        <div className="bg-white rounded-xl shadow-md border border-gold/20 overflow-hidden">
          <div className="p-6 border-b border-border flex justify-between items-center">
            <h2 className="text-xl font-bold text-maroon">Registered Profiles</h2>
            <Button
              onClick={fetchProfiles}
              variant="outline"
              size="sm"
              disabled={loadingProfiles}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loadingProfiles ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Profile For</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered On</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No profiles found
                    </TableCell>
                  </TableRow>
                ) : (
                  profiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">{profile.name}</TableCell>
                      <TableCell className="capitalize">{profile.profile_for || "-"}</TableCell>
                      <TableCell className="capitalize">{profile.gender}</TableCell>
                      <TableCell>{profile.email}</TableCell>
                      <TableCell>{profile.phone}</TableCell>
                      <TableCell>
                        {profile.email_verified ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(profile.created_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;
