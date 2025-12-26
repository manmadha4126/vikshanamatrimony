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
import { RefreshCw, Users, CheckCircle, Clock, Search, ChevronLeft, ChevronRight, UserPlus, Edit, Trash2, Home, XCircle, Phone, Mail, MapPin, Briefcase, GraduationCap, User as UserIcon, Calendar, Heart } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { EditProfileDialog } from "@/components/staff/EditProfileDialog";

interface Profile {
  id: string;
  profile_id: string | null;
  name: string;
  email: string;
  phone: string;
  gender: string;
  profile_for: string | null;
  email_verified: boolean;
  verification_status: string | null;
  admin_notes: string | null;
  created_at: string;
  // Full profile details
  date_of_birth: string | null;
  mother_tongue: string | null;
  height: string | null;
  marital_status: string | null;
  religion: string | null;
  caste: string | null;
  sub_caste: string | null;
  gothram: string | null;
  star: string | null;
  dosham: string | null;
  family_status: string | null;
  family_type: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  education: string | null;
  education_detail: string | null;
  employment_type: string | null;
  occupation: string | null;
  company_name: string | null;
  annual_income: string | null;
  photo_url: string | null;
}

type VerificationFilter = "all" | "pending" | "verified" | "rejected";

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
  const [activeSection, setActiveSection] = useState<"profiles" | "add">("profiles");
  const [deleteProfile, setDeleteProfile] = useState<Profile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>("all");
  const [verifyingProfile, setVerifyingProfile] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [editProfile, setEditProfile] = useState<Profile | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, verificationFilter]);

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
        .select("*")
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

  const handleDeleteProfile = async () => {
    if (!deleteProfile) return;
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", deleteProfile.id);
      
      if (error) throw error;
      
      toast({
        title: "Profile Deleted",
        description: `Profile ${deleteProfile.profile_id || deleteProfile.name} has been deleted.`,
      });
      setDeleteProfile(null);
      fetchProfiles();
    } catch (error: any) {
      console.error("Error deleting profile:", error);
      toast({
        title: "Error",
        description: "Failed to delete profile",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleEditProfile = (profile: Profile) => {
    setEditProfile(profile);
  };

  const handleVerifyProfile = async (status: "verified" | "rejected") => {
    if (!selectedProfile) return;
    setVerifyingProfile(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ 
          verification_status: status,
          email_verified: status === "verified",
          admin_notes: adminNotes || null
        })
        .eq("id", selectedProfile.id);
      
      if (error) throw error;
      
      toast({
        title: status === "verified" ? "Profile Verified" : "Profile Rejected",
        description: `Profile ${selectedProfile.profile_id || selectedProfile.name} has been ${status}.`,
      });
      setSelectedProfile(null);
      setAdminNotes("");
      fetchProfiles();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile status",
        variant: "destructive",
      });
    } finally {
      setVerifyingProfile(false);
    }
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

  const formatDOB = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const calculateAge = (dateString: string | null) => {
    if (!dateString) return null;
    const today = new Date();
    const birthDate = new Date(dateString);
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
      years--;
      months += 12;
    }
    
    if (today.getDate() < birthDate.getDate()) {
      months--;
      if (months < 0) months += 12;
    }
    
    return { years, months };
  };

  const formatAge = (dateString: string | null) => {
    const age = calculateAge(dateString);
    if (!age) return "-";
    if (age.months === 0) return `${age.years} years`;
    return `${age.years} years ${age.months} months`;
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Verified</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream via-white to-cream">
        <div className="animate-pulse text-maroon">Loading dashboard...</div>
      </div>
    );
  }

  // Filter profiles based on verification status
  const statusFilteredProfiles = profiles.filter((profile) => {
    if (verificationFilter === "all") return true;
    const status = profile.verification_status || "pending";
    return status === verificationFilter;
  });

  // Then apply search filter
  const filteredProfiles = statusFilteredProfiles.filter((profile) => {
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
  const verifiedProfiles = profiles.filter(p => p.verification_status === "verified").length;
  const pendingVerification = profiles.filter(p => !p.verification_status || p.verification_status === "pending").length;
  const rejectedProfiles = profiles.filter(p => p.verification_status === "rejected").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gold/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              size="sm"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-maroon">Staff Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome, {user?.email} • <span className="capitalize font-medium">{userRole}</span>
              </p>
            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

          <div className="bg-white rounded-xl shadow-md p-6 border border-gold/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Rejected Profiles</h3>
                <p className="text-3xl font-bold text-foreground">{rejectedProfiles}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${activeSection === "profiles" ? "ring-2 ring-primary border-primary" : "border-gold/20"}`}
            onClick={() => setActiveSection("profiles")}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl text-maroon">Registered Profiles</CardTitle>
                  <CardDescription>View and manage all registered profiles</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{totalRegistrations} Profiles</p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg ${activeSection === "add" ? "ring-2 ring-primary border-primary" : "border-gold/20"}`}
            onClick={() => setActiveSection("add")}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <UserPlus className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl text-maroon">Add New Profile</CardTitle>
                  <CardDescription>Create a new profile manually</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                variant="primary" 
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/register?from=staff");
                }}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create New Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Profiles Table - Only show when activeSection is "profiles" */}
        {activeSection === "profiles" && (
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
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by Profile ID, Name, or Email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Status Filter Tabs */}
                <Tabs value={verificationFilter} onValueChange={(v) => setVerificationFilter(v as VerificationFilter)}>
                  <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                    <TabsTrigger value="all" className="text-xs sm:text-sm">All ({profiles.length})</TabsTrigger>
                    <TabsTrigger value="verified" className="text-xs sm:text-sm text-green-700">Verified ({verifiedProfiles})</TabsTrigger>
                    <TabsTrigger value="pending" className="text-xs sm:text-sm text-yellow-700">Pending ({pendingVerification})</TabsTrigger>
                    <TabsTrigger value="rejected" className="text-xs sm:text-sm text-red-700">Rejected ({rejectedProfiles})</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {searchQuery && (
                <p className="text-sm text-muted-foreground">
                  Showing {filteredProfiles.length} of {statusFilteredProfiles.length} profiles
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProfiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        {searchQuery ? "No profiles match your search" : "No profiles found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedProfiles.map((profile) => (
                      <TableRow 
                        key={profile.id} 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => {
                          setSelectedProfile(profile);
                          setAdminNotes(profile.admin_notes || "");
                        }}
                      >
                        <TableCell className="font-mono font-bold text-primary">{profile.profile_id || "-"}</TableCell>
                        <TableCell className="font-medium">{profile.name}</TableCell>
                        <TableCell className="capitalize">{profile.profile_for || "-"}</TableCell>
                        <TableCell className="capitalize">{profile.gender}</TableCell>
                        <TableCell>{profile.email}</TableCell>
                        <TableCell>{profile.phone}</TableCell>
                        <TableCell>
                          {getStatusBadge(profile.verification_status)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(profile.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProfile(profile);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteProfile(profile);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
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
        )}

        {/* Add Profile Section - Show when activeSection is "add" */}
        {activeSection === "add" && (
          <div className="bg-white rounded-xl shadow-md border border-gold/20 p-8 text-center">
            <div className="max-w-md mx-auto space-y-6">
              <div className="p-4 bg-green-100 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                <UserPlus className="w-10 h-10 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-maroon mb-2">Create New Profile</h2>
                <p className="text-muted-foreground">
                  Click the button below to add a new profile to the system. You'll be redirected to the registration form.
                </p>
              </div>
              <Button 
                variant="primary" 
                size="lg"
                className="w-full"
                onClick={() => navigate("/register?from=staff")}
              >
                <UserPlus className="w-5 h-5 mr-2" />
                Start Registration
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Full Profile Detail Modal */}
      <Dialog open={!!selectedProfile} onOpenChange={(open) => !open && setSelectedProfile(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-maroon flex items-center justify-between">
              <div className="flex items-center gap-2">
                Profile Details
                {selectedProfile?.profile_id && (
                  <span className="font-mono text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                    {selectedProfile.profile_id}
                  </span>
                )}
              </div>
              {selectedProfile && getStatusBadge(selectedProfile.verification_status)}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProfile && (
            <ScrollArea className="max-h-[calc(90vh-180px)]">
              <div className="p-6 space-y-6">
                {/* Profile Header with Photo */}
                <div className="flex items-start gap-6">
                  <Avatar className="w-24 h-24 border-2 border-primary/20">
                    <AvatarImage src={selectedProfile.photo_url || undefined} alt={selectedProfile.name} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {selectedProfile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">{selectedProfile.name}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        {selectedProfile.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        {selectedProfile.phone}
                      </span>
                    </div>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Profile For:</span>{" "}
                      <span className="capitalize font-medium">{selectedProfile.profile_for || "-"}</span>
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Personal Details */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-maroon flex items-center gap-2">
                    <UserIcon className="w-4 h-4" />
                    Personal Details
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Gender</label>
                      <p className="capitalize font-medium">{selectedProfile.gender}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Date of Birth</label>
                      <p className="font-medium">{formatDOB(selectedProfile.date_of_birth)}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Age</label>
                      <p className="font-medium">{formatAge(selectedProfile.date_of_birth)}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Height</label>
                      <p className="font-medium">{selectedProfile.height || "-"}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Mother Tongue</label>
                      <p className="font-medium">{selectedProfile.mother_tongue || "-"}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Marital Status</label>
                      <p className="capitalize font-medium">{selectedProfile.marital_status || "-"}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Religion & Caste */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-maroon flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Religion & Caste
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Religion</label>
                      <p className="font-medium">{selectedProfile.religion || "-"}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Caste</label>
                      <p className="font-medium">{selectedProfile.caste || "-"}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Sub Caste</label>
                      <p className="font-medium">{selectedProfile.sub_caste || "-"}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Gothram</label>
                      <p className="font-medium">{selectedProfile.gothram || "-"}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Star</label>
                      <p className="font-medium">{selectedProfile.star || "-"}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Dosham</label>
                      <p className="font-medium">{selectedProfile.dosham || "-"}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Family Details */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-maroon flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Family Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Family Status</label>
                      <p className="font-medium">{selectedProfile.family_status || "-"}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Family Type</label>
                      <p className="font-medium">{selectedProfile.family_type || "-"}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Location */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-maroon flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Country</label>
                      <p className="font-medium">{selectedProfile.country || "-"}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">State</label>
                      <p className="font-medium">{selectedProfile.state || "-"}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">City</label>
                      <p className="font-medium">{selectedProfile.city || "-"}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Education & Career */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-maroon flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Education & Career
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Education</label>
                      <p className="font-medium">{selectedProfile.education || "-"}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Education Detail</label>
                      <p className="font-medium">{selectedProfile.education_detail || "-"}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Employment Type</label>
                      <p className="font-medium">{selectedProfile.employment_type || "-"}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Occupation</label>
                      <p className="font-medium">{selectedProfile.occupation || "-"}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Company</label>
                      <p className="font-medium">{selectedProfile.company_name || "-"}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase">Annual Income</label>
                      <p className="font-medium">{selectedProfile.annual_income || "-"}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Registration Info */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-maroon flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Registration Info
                  </h4>
                  <div className="text-sm">
                    <label className="text-xs text-muted-foreground uppercase">Registered On</label>
                    <p className="font-medium">{formatDate(selectedProfile.created_at)}</p>
                  </div>
                </div>

                <Separator />

                {/* Verification Section */}
                <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-maroon flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Verification (Admin Action)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Call the customer to verify their details, then approve or reject the profile.
                  </p>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Admin Notes (Optional)</label>
                    <Textarea 
                      placeholder="Add notes about the verification call..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => handleVerifyProfile("verified")}
                      disabled={verifyingProfile}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {verifyingProfile ? "Processing..." : "Verify Profile"}
                    </Button>
                    <Button 
                      onClick={() => handleVerifyProfile("rejected")}
                      disabled={verifyingProfile}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {verifyingProfile ? "Processing..." : "Reject Profile"}
                    </Button>
                  </div>
                  {selectedProfile.admin_notes && (
                    <div className="mt-3 p-3 bg-muted rounded-md">
                      <label className="text-xs text-muted-foreground uppercase">Previous Admin Notes</label>
                      <p className="text-sm mt-1">{selectedProfile.admin_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProfile} onOpenChange={(open) => !open && setDeleteProfile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the profile for <strong>{deleteProfile?.name}</strong> ({deleteProfile?.profile_id || deleteProfile?.email})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProfile}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        profile={editProfile}
        open={!!editProfile}
        onOpenChange={(open) => !open && setEditProfile(null)}
        onSaved={fetchProfiles}
      />
    </div>
  );
};

export default StaffDashboard;
