import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyOtpRequest {
  email: string;
  otp: string;
  profileId: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otp, profileId }: VerifyOtpRequest = await req.json();

    if (!email || !otp || !profileId) {
      throw new Error("Missing required fields");
    }

    console.log("Verifying OTP for:", email);

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get profile and check OTP
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("email_otp, otp_expires_at")
      .eq("id", profileId)
      .eq("email", email)
      .single();

    if (fetchError || !profile) {
      console.error("Profile not found:", fetchError);
      return new Response(
        JSON.stringify({ verified: false, error: "Profile not found" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check if OTP matches and is not expired
    const now = new Date();
    const otpExpiresAt = profile.otp_expires_at ? new Date(profile.otp_expires_at) : null;

    if (!profile.email_otp || profile.email_otp !== otp) {
      console.log("OTP mismatch");
      return new Response(
        JSON.stringify({ verified: false, error: "Invalid OTP" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!otpExpiresAt || now > otpExpiresAt) {
      console.log("OTP expired");
      return new Response(
        JSON.stringify({ verified: false, error: "OTP has expired" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // OTP is valid - update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        email_verified: true,
        email_otp: null,
        otp_expires_at: null,
      })
      .eq("id", profileId);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      throw new Error("Failed to verify email");
    }

    console.log("Email verified successfully for:", email);

    return new Response(
      JSON.stringify({ verified: true, message: "Email verified successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in verify-email-otp function:", error);
    return new Response(
      JSON.stringify({ verified: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
