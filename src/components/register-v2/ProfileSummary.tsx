import { Button } from "@/components/ui/button";
import { CheckCircle, Edit, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfileSummaryProps {
  profileData: any;
  photoUrl: string | null;
}

const ProfileSummary = ({ profileData, photoUrl }: ProfileSummaryProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground">Profile Created!</h2>
        <p className="text-muted-foreground">Your profile has been created successfully</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-4">
          {photoUrl ? (
            <img src={photoUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground">?</div>
          )}
          <div>
            <h3 className="font-semibold text-lg">Your Profile</h3>
            <p className="text-sm text-muted-foreground">{profileData?.height} • {profileData?.maritalStatus?.replace("_", " ")}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-muted-foreground">Mother Tongue:</span> <span className="font-medium">{profileData?.motherTongue}</span></div>
          <div><span className="text-muted-foreground">Religion:</span> <span className="font-medium capitalize">{profileData?.religion}</span></div>
          <div><span className="text-muted-foreground">Location:</span> <span className="font-medium">{profileData?.city}, {profileData?.state}</span></div>
          <div><span className="text-muted-foreground">Education:</span> <span className="font-medium uppercase">{profileData?.educationLevel}</span></div>
        </div>
      </div>

      <div className="space-y-2">
        <Button onClick={() => navigate("/")} className="w-full h-12" variant="primary">
          <Home className="mr-2 h-4 w-4" /> Go to Home
        </Button>
        <Button variant="outline" className="w-full">
          <Edit className="mr-2 h-4 w-4" /> Edit Profile
        </Button>
      </div>
    </div>
  );
};

export default ProfileSummary;
