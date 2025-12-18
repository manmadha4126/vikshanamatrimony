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
import { RefreshCw, Users, CheckCircle, Clock, Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Profile {
  id: string;
  profile_id: string | null;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

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
        .select("id, profile_id, name, email, phone, gender, profile_for, email_verified, created_at")
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

  const filteredProfiles = profiles.filter((profile) => {
    const query = searchQuery.toLowerCase();
    return (
      (profile.profile_id?.toLowerCase() || "").includes(query) ||
      profile.name.toLowerCase().includes(query) ||
      profile.email.toLowerCase().includes(query)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProfiles = filteredProfiles.slice(startIndex, endIndex);


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
          <div className="p-6 border-b border-border space-y-4">
            <div className="flex justify-between items-center">
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
            
            {/* Search Input */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by Profile ID, Name, or Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchQuery && (
              <p className="text-sm text-muted-foreground">
                Showing {filteredProfiles.length} of {profiles.length} profiles
              </p>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profile ID</TableHead>
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
                {paginatedProfiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No profiles match your search" : "No profiles found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProfiles.map((profile) => (
                    <TableRow 
                      key={profile.id} 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedProfile(profile)}
                    >
                      <TableCell className="font-mono font-bold text-primary">{profile.profile_id || "-"}</TableCell>
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

          {/* Pagination Controls */}
          {filteredProfiles.length > 0 && (
            <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Show</span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[70px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span>per page</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {startIndex + 1}-{Math.min(endIndex, filteredProfiles.length)} of {filteredProfiles.length}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm px-2">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Profile Detail Modal */}
      <Dialog open={!!selectedProfile} onOpenChange={(open) => !open && setSelectedProfile(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-maroon flex items-center gap-2">
              Profile Details
              {selectedProfile?.profile_id && (
                <span className="font-mono text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                  {selectedProfile.profile_id}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProfile && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</label>
                  <p className="font-medium">{selectedProfile.name}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Gender</label>
                  <p className="capitalize">{selectedProfile.gender}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Profile For</label>
                  <p className="capitalize">{selectedProfile.profile_for || "-"}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</label>
                  <div>
                    {selectedProfile.email_verified ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                        Pending Verification
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4 space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</label>
                  <p className="font-medium">{selectedProfile.email}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Phone</label>
                  <p className="font-medium">{selectedProfile.phone}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Registered On</label>
                  <p className="text-sm text-muted-foreground">{formatDate(selectedProfile.created_at)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffDashboard;
