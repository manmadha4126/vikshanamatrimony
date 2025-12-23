import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendOtpRequest {
  email: string;
  name: string;
  gender: string;
  phone: string;
  profileFor: string;
}

const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, gender, phone, profileFor }: SendOtpRequest = await req.json();

    if (!email || !name || !gender || !phone || !profileFor) {
      throw new Error("Missing required fields");
    }

    console.log("Sending OTP to:", email);

    // Generate OTP
    const otp = generateOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if profile exists with this email
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    let profileId: string;

    if (existingProfile) {
      // Update existing profile with OTP
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          email_otp: otp,
          otp_expires_at: otpExpiresAt.toISOString(),
          name,
          gender,
          phone,
          profile_for: profileFor,
        })
        .eq("id", existingProfile.id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        throw new Error("Failed to save OTP");
      }
      profileId = existingProfile.id;
    } else {
      // Create new profile with OTP
      const { data: newProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          email,
          name,
          gender,
          phone,
          profile_for: profileFor,
          email_otp: otp,
          otp_expires_at: otpExpiresAt.toISOString(),
        })
        .select("id")
        .single();

      if (insertError) {
        console.error("Error creating profile:", insertError);
        throw new Error("Failed to create profile");
      }
      profileId = newProfile.id;
    }

    // Send OTP via email using Resend API
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f9f5f2;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #722f37 0%, #8b4513 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Lakshmi Matrimony</h1>
            <p style="color: #f0e6d3; margin: 10px 0 0 0; font-size: 14px;">Finding your perfect match</p>
          </div>
          <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <h2 style="color: #722f37; margin: 0 0 20px 0; font-size: 24px;">Welcome, ${name}!</h2>
            <p style="color: #666; line-height: 1.6; margin: 0 0 25px 0;">
              Thank you for registering with Lakshmi Matrimony. To complete your registration, please use the verification code below:
            </p>
            <div style="background: linear-gradient(135deg, #f8f4f0 0%, #f0e6d3 100%); border: 2px dashed #d4af37; border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0;">
              <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Your OTP Code</p>
              <h1 style="color: #722f37; margin: 0; font-size: 40px; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
            </div>
            <p style="color: #999; font-size: 13px; text-align: center; margin: 20px 0 0 0;">
              This code will expire in <strong>10 minutes</strong>.<br>
              If you didn't request this code, please ignore this email.
            </p>
          </div>
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p style="margin: 0;">© 2024 Lakshmi Matrimony. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">This website is strictly for matrimonial purpose only.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Try to send email, but don't fail if Resend is in test mode
    let emailSent = false;
    let emailError = null;
    
    try {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Lakshmi Matrimony <onboarding@resend.dev>",
          to: [email],
          subject: "Your Verification Code - Lakshmi Matrimony",
          html: emailHtml,
        }),
      });

      const emailData = await emailResponse.json();
      
      if (emailResponse.ok) {
        emailSent = true;
        console.log("Email sent successfully:", emailData);
      } else {
        emailError = emailData.message || "Failed to send email";
        console.warn("Resend API warning (test mode):", emailData);
      }
    } catch (e: any) {
      emailError = e.message;
      console.warn("Email sending failed:", e.message);
    }

    // Return success with OTP for development/testing (when email fails due to Resend test mode)
    // In production with verified domain, remove the devOtp field
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: emailSent 
          ? "OTP sent successfully to your email" 
          : "OTP generated (check below for testing - email not sent due to Resend test mode)",
        profileId,
        emailSent,
        // Include OTP for development testing when email fails
        ...(emailSent ? {} : { devOtp: otp, devNote: "Use this OTP for testing. In production, verify your domain at resend.com/domains" })
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-email-otp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
