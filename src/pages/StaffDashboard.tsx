import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
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
import { RefreshCw, Users, CheckCircle, Clock, Search, ChevronLeft, ChevronRight, UserPlus, Edit, Trash2, Home, XCircle, Phone, Mail, MapPin, Briefcase, GraduationCap, User as UserIcon, Calendar, Heart, LogOut, Shield, Sun, Moon, KeyRound, CreditCard, PhoneCall, History } from "lucide-react";
import vikshanaLogo from "@/assets/vikshana-logo.png";
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
import VerificationCenter from "@/components/staff/VerificationCenter";
import SubscriptionApproval from "@/components/staff/SubscriptionApproval";
import SuccessStoriesApproval from "@/components/staff/SuccessStoriesApproval";
import CallbackRequestsSection from "@/components/staff/CallbackRequestsSection";
import PaymentHistorySection from "@/components/staff/PaymentHistorySection";
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
type GenderFilter = "all" | "male" | "female";

const StaffDashboard = () => {
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState({ all: 0, verified: 0, pending: 0, rejected: 0 });
  const [genderCounts, setGenderCounts] = useState({ all: 0, male: 0, female: 0 });
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [activeSection, setActiveSection] = useState<"profiles" | "add" | "verification" | "stories" | "subscriptions" | "callbacks" | "payment-history">("profiles");
  const [deleteProfile, setDeleteProfile] = useState<Profile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [verificationFilter, setVerificationFilter] = useState<VerificationFilter>("all");
  const [verifyingProfile, setVerifyingProfile] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [editProfile, setEditProfile] = useState<Profile | null>(null);
  const [sendingPasswordReset, setSendingPasswordReset] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [verificationFilter, genderFilter]);

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
        // fetchProfiles is handled by useEffect when userRole changes
      } else {
        navigate("/staff-login");
      }
    } else {
      navigate("/staff-login");
    }
    setLoading(false);
  };

  // Fetch status counts for dashboard stats
  const fetchStatusCounts = async () => {
    try {
      const [allCount, verifiedCount, pendingCount, rejectedCount, maleCount, femaleCount] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("verification_status", "verified"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).or("verification_status.is.null,verification_status.eq.pending"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("verification_status", "rejected"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("gender", "Male"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("gender", "Female"),
      ]);
      
      setStatusCounts({
        all: allCount.count || 0,
        verified: verifiedCount.count || 0,
        pending: pendingCount.count || 0,
        rejected: rejectedCount.count || 0,
      });
      
      setGenderCounts({
        all: allCount.count || 0,
        male: maleCount.count || 0,
        female: femaleCount.count || 0,
      });
    } catch (error) {
      console.error("Error fetching status counts:", error);
    }
  };

  const fetchProfiles = async () => {
    setLoadingProfiles(true);
    try {
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      // Build query with server-side filtering
      let query = supabase
        .from("profiles")
        .select("*", { count: "exact" });

      // Apply verification filter
      if (verificationFilter === "verified") {
        query = query.eq("verification_status", "verified");
      } else if (verificationFilter === "pending") {
        query = query.or("verification_status.is.null,verification_status.eq.pending");
      } else if (verificationFilter === "rejected") {
        query = query.eq("verification_status", "rejected");
      }

      // Apply gender filter
      if (genderFilter === "male") {
        query = query.eq("gender", "Male");
      } else if (genderFilter === "female") {
        query = query.eq("gender", "Female");
      }

      // Apply search filter (server-side)
      if (debouncedSearch) {
        query = query.or(`profile_id.ilike.%${debouncedSearch}%,name.ilike.%${debouncedSearch}%,email.ilike.%${debouncedSearch}%`);
      }

      // Order and paginate
      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      setProfiles(data || []);
      setTotalCount(count || 0);
      
      // Also refresh status counts
      await fetchStatusCounts();
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

  // Fetch profiles when pagination, filter, or search changes
  useEffect(() => {
    if (userRole) {
      fetchProfiles();
    }
  }, [currentPage, itemsPerPage, verificationFilter, genderFilter, debouncedSearch, userRole]);

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

  const handleSendPasswordReset = async (email: string) => {
    setSendingPasswordReset(email);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('send-password-reset', {
        body: { email },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to send password reset email');
      }

      toast({
        title: "Password Reset Sent",
        description: `A password reset email has been sent to ${email}`,
      });
    } catch (error: any) {
      console.error("Error sending password reset:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset email",
        variant: "destructive",
      });
    } finally {
      setSendingPasswordReset(null);
    }
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

  // Server-side pagination - profiles are already filtered and paginated
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount);

  // Use server-side counts for stats
  const totalRegistrations = statusCounts.all;
  const verifiedProfiles = statusCounts.verified;
  const pendingVerification = statusCounts.pending;
  const rejectedProfiles = statusCounts.rejected;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Decorative Top Border */}
      <div className="h-1 bg-gradient-to-r from-primary via-gold to-green-600" />
      
      {/* Header */}
      <header className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg border-b border-gold/30 dark:border-gold/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex justify-between items-center">
            {/* Left Side - Logo and Branding */}
            <div className="flex items-center gap-4">
              <div 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => navigate("/")}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-gold/20 rounded-full blur-md group-hover:blur-lg transition-all" />
                  <img 
                    src={vikshanaLogo} 
                    alt="Vikshana Matrimony" 
                    className="h-12 w-12 object-contain relative z-10 group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold">
                    <span className="text-primary">Vikshana</span>
                    <span className="text-green-600"> Matrimony</span>
                  </h1>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                      <Shield className="w-3 h-3 mr-1" />
                      Staff Dashboard
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Decorative Separator */}
              <div className="hidden lg:block h-10 w-px bg-gradient-to-b from-transparent via-gold/50 to-transparent mx-2" />
              
              {/* Welcome Message - Desktop */}
              <div className="hidden lg:block">
                <p className="text-sm text-muted-foreground">
                  Welcome back,
                </p>
                <p className="text-sm font-medium text-foreground flex items-center gap-1">
                  {user?.email}
                  <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full capitalize">
                    {userRole}
                  </span>
                </p>
              </div>
            </div>
            
            {/* Right Side - Actions */}
            <div className="flex items-center gap-2">
              {/* Dark Mode Toggle */}
              <Button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                variant="outline"
                size="sm"
                className="border-gold/30 text-foreground hover:bg-muted transition-all duration-300 shadow-sm"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                size="sm"
                className="border-primary/30 text-primary hover:bg-primary hover:text-white transition-all duration-300 shadow-sm"
              >
                <Home className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Home</span>
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-maroon/30 text-maroon hover:bg-maroon hover:text-white transition-all duration-300 shadow-sm"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
          
          {/* Mobile Welcome Message */}
          <div className="sm:hidden mt-2 pt-2 border-t border-gold/20">
            <p className="text-xs text-muted-foreground text-center">
              {user?.email} • <span className="capitalize text-primary font-medium">{userRole}</span>
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gold/20 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Total Registrations</h3>
                <p className="text-3xl font-bold text-foreground">{totalRegistrations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gold/20 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Verified Profiles</h3>
                <p className="text-3xl font-bold text-foreground">{verifiedProfiles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gold/20 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Pending Verification</h3>
                <p className="text-3xl font-bold text-foreground">{pendingVerification}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gold/20 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Rejected Profiles</h3>
                <p className="text-3xl font-bold text-foreground">{rejectedProfiles}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Boxes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-8">
          <Card 
            className={`cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${activeSection === "profiles" ? "ring-2 ring-primary" : ""} bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 border-blue-200 dark:border-blue-800`}
            onClick={() => setActiveSection("profiles")}
          >
            <CardHeader className="pb-2 pt-3 px-3">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-2 bg-blue-500/20 dark:bg-blue-400/20 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-sm text-blue-900 dark:text-blue-100 leading-tight">Profiles</CardTitle>
                  <CardDescription className="text-[10px] text-blue-600/70 dark:text-blue-300/70 hidden sm:block">View & manage</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3 px-3 pt-0">
              <p className="text-xl font-bold text-blue-700 dark:text-blue-300 text-center">{totalRegistrations}</p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${activeSection === "verification" ? "ring-2 ring-primary" : ""} bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950 dark:to-orange-900 border-amber-200 dark:border-amber-800`}
            onClick={() => setActiveSection("verification")}
          >
            <CardHeader className="pb-2 pt-3 px-3">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-2 bg-amber-500/20 dark:bg-amber-400/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <CardTitle className="text-sm text-amber-900 dark:text-amber-100 leading-tight">Verification</CardTitle>
                  <CardDescription className="text-[10px] text-amber-600/70 dark:text-amber-300/70 hidden sm:block">Review profiles</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3 px-3 pt-0">
              <div className="flex justify-center gap-1">
                <div className="bg-yellow-100/80 dark:bg-yellow-800/50 rounded px-2 py-1 text-center">
                  <p className="text-sm font-bold text-yellow-600 dark:text-yellow-300">{pendingVerification}</p>
                  <p className="text-[8px] text-yellow-600/80 dark:text-yellow-300/80">Pending</p>
                </div>
                <div className="bg-green-100/80 dark:bg-green-800/50 rounded px-2 py-1 text-center">
                  <p className="text-sm font-bold text-green-600 dark:text-green-300">{verifiedProfiles}</p>
                  <p className="text-[8px] text-green-600/80 dark:text-green-300/80">Done</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${activeSection === "add" ? "ring-2 ring-primary" : ""} bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950 dark:to-teal-900 border-emerald-200 dark:border-emerald-800`}
            onClick={() => setActiveSection("add")}
          >
            <CardHeader className="pb-2 pt-3 px-3">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-2 bg-emerald-500/20 dark:bg-emerald-400/20 rounded-lg">
                  <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-sm text-emerald-900 dark:text-emerald-100 leading-tight">Add Profile</CardTitle>
                  <CardDescription className="text-[10px] text-emerald-600/70 dark:text-emerald-300/70 hidden sm:block">Create new</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3 px-3 pt-0">
              <Button 
                size="sm"
                className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-xs h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate("/register?from=staff");
                }}
              >
                <UserPlus className="w-3 h-3 mr-1" />
                Create
              </Button>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${activeSection === "stories" ? "ring-2 ring-primary" : ""} bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-950 dark:to-rose-900 border-pink-200 dark:border-pink-800`}
            onClick={() => setActiveSection("stories")}
          >
            <CardHeader className="pb-2 pt-3 px-3">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-2 bg-pink-500/20 dark:bg-pink-400/20 rounded-lg">
                  <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <CardTitle className="text-sm text-pink-900 dark:text-pink-100 leading-tight">Stories</CardTitle>
                  <CardDescription className="text-[10px] text-pink-600/70 dark:text-pink-300/70 hidden sm:block">Success stories</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3 px-3 pt-0">
              <p className="text-xs text-pink-600/80 dark:text-pink-300/80 text-center">Review & publish</p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${activeSection === "subscriptions" ? "ring-2 ring-primary" : ""} bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950 dark:to-violet-900 border-purple-200 dark:border-purple-800`}
            onClick={() => setActiveSection("subscriptions")}
          >
            <CardHeader className="pb-2 pt-3 px-3">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-2 bg-purple-500/20 dark:bg-purple-400/20 rounded-lg">
                  <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-sm text-purple-900 dark:text-purple-100 leading-tight">Subscriptions</CardTitle>
                  <CardDescription className="text-[10px] text-purple-600/70 dark:text-purple-300/70 hidden sm:block">Approve payments</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3 px-3 pt-0">
              <p className="text-xs text-purple-600/80 dark:text-purple-300/80 text-center">Review & approve</p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${activeSection === "callbacks" ? "ring-2 ring-primary" : ""} bg-gradient-to-br from-cyan-50 to-sky-100 dark:from-cyan-950 dark:to-sky-900 border-cyan-200 dark:border-cyan-800`}
            onClick={() => setActiveSection("callbacks")}
          >
            <CardHeader className="pb-2 pt-3 px-3">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-2 bg-cyan-500/20 dark:bg-cyan-400/20 rounded-lg">
                  <PhoneCall className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <CardTitle className="text-sm text-cyan-900 dark:text-cyan-100 leading-tight">Callbacks</CardTitle>
                  <CardDescription className="text-[10px] text-cyan-600/70 dark:text-cyan-300/70 hidden sm:block">Manage requests</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3 px-3 pt-0">
              <p className="text-xs text-cyan-600/80 dark:text-cyan-300/80 text-center">View & manage</p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] ${activeSection === "payment-history" ? "ring-2 ring-primary" : ""} bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950 dark:to-gray-900 border-slate-200 dark:border-slate-800`}
            onClick={() => setActiveSection("payment-history")}
          >
            <CardHeader className="pb-2 pt-3 px-3">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="p-2 bg-slate-500/20 dark:bg-slate-400/20 rounded-lg">
                  <History className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div>
                  <CardTitle className="text-sm text-slate-900 dark:text-slate-100 leading-tight">History</CardTitle>
                  <CardDescription className="text-[10px] text-slate-600/70 dark:text-slate-300/70 hidden sm:block">All transactions</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-3 px-3 pt-0">
              <p className="text-xs text-slate-600/80 dark:text-slate-300/80 text-center">Payment logs</p>
            </CardContent>
          </Card>
        </div>

        {/* Callback Requests Section */}
        {activeSection === "callbacks" && (
          <CallbackRequestsSection />
        )}

        {/* Verification Center Section */}
        {activeSection === "verification" && (
          <VerificationCenter />
        )}

        {/* Success Stories Approval Section */}
        {activeSection === "stories" && (
          <SuccessStoriesApproval />
        )}

        {/* Subscription Approval Section */}
        {activeSection === "subscriptions" && (
          <SubscriptionApproval />
        )}

        {/* Payment History Section */}
        {activeSection === "payment-history" && (
          <PaymentHistorySection />
        )}

        {/* Profiles Table - Only show when activeSection is "profiles" */}
        {activeSection === "profiles" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gold/20 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-border dark:border-gray-700 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-maroon dark:text-primary">Registered Profiles</h2>
                <Button
                  onClick={fetchProfiles}
                  variant="outline"
                  size="sm"
                  disabled={loadingProfiles}
                  className="dark:border-gray-600 dark:hover:bg-gray-700"
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
                    className="pl-10 dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                {/* Status Filter Tabs */}
                <Tabs value={verificationFilter} onValueChange={(v) => setVerificationFilter(v as VerificationFilter)}>
                  <TabsList className="grid grid-cols-4 w-full sm:w-auto dark:bg-gray-700">
                    <TabsTrigger value="all" className="text-xs sm:text-sm">All ({statusCounts.all})</TabsTrigger>
                    <TabsTrigger value="verified" className="text-xs sm:text-sm text-green-700 dark:text-green-400">Verified ({verifiedProfiles})</TabsTrigger>
                    <TabsTrigger value="pending" className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-400">Pending ({pendingVerification})</TabsTrigger>
                    <TabsTrigger value="rejected" className="text-xs sm:text-sm text-red-700 dark:text-red-400">Rejected ({rejectedProfiles})</TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Gender Filter Tabs */}
                <Tabs value={genderFilter} onValueChange={(v) => setGenderFilter(v as GenderFilter)}>
                  <TabsList className="grid grid-cols-3 w-full sm:w-auto dark:bg-gray-700">
                    <TabsTrigger value="all" className="text-xs sm:text-sm">All ({genderCounts.all})</TabsTrigger>
                    <TabsTrigger value="male" className="text-xs sm:text-sm text-blue-700 dark:text-blue-400">Males ({genderCounts.male})</TabsTrigger>
                    <TabsTrigger value="female" className="text-xs sm:text-sm text-pink-700 dark:text-pink-400">Females ({genderCounts.female})</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {debouncedSearch && (
                <p className="text-sm text-muted-foreground">
                  Showing {profiles.length} results for "{debouncedSearch}"
                </p>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="dark:border-gray-700">
                    <TableHead className="dark:text-gray-300">Profile ID</TableHead>
                    <TableHead className="dark:text-gray-300">Name</TableHead>
                    <TableHead className="dark:text-gray-300">Profile For</TableHead>
                    <TableHead className="dark:text-gray-300">Gender</TableHead>
                    <TableHead className="dark:text-gray-300">Email</TableHead>
                    <TableHead className="dark:text-gray-300">Phone</TableHead>
                    <TableHead className="dark:text-gray-300">Status</TableHead>
                    <TableHead className="dark:text-gray-300">Registered On</TableHead>
                    <TableHead className="text-right dark:text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.length === 0 ? (
                    <TableRow className="dark:border-gray-700">
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        {loadingProfiles ? "Loading profiles..." : (debouncedSearch ? "No profiles match your search" : "No profiles found")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    profiles.map((profile) => (
                      <TableRow 
                        key={profile.id} 
                        className="cursor-pointer hover:bg-muted/50 dark:hover:bg-gray-700/50 transition-colors dark:border-gray-700"
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
            {totalCount > 0 && (
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
                    {startIndex + 1}-{endIndex} of {totalCount}
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
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Profile For:</span>{" "}
                        <span className="capitalize font-medium">{selectedProfile.profile_for || "-"}</span>
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendPasswordReset(selectedProfile.email)}
                        disabled={sendingPasswordReset === selectedProfile.email}
                        className="gap-1.5 text-xs h-7"
                      >
                        <KeyRound className="w-3 h-3" />
                        {sendingPasswordReset === selectedProfile.email ? "Sending..." : "Send Password Reset"}
                      </Button>
                    </div>
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
