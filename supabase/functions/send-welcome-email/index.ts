import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  name: string;
  profileId: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, profileId }: WelcomeEmailRequest = await req.json();

    if (!email || !name || !profileId) {
      throw new Error("Missing required fields");
    }

    console.log("Sending welcome email to:", email, "with profile ID:", profileId);

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
            <h2 style="color: #722f37; margin: 0 0 20px 0; font-size: 24px;">Welcome to Lakshmi Matrimony, ${name}!</h2>
            <p style="color: #666; line-height: 1.6; margin: 0 0 25px 0;">
              Congratulations! Your account has been successfully created. We're excited to help you find your perfect life partner.
            </p>
            <div style="background: linear-gradient(135deg, #f8f4f0 0%, #f0e6d3 100%); border: 2px solid #d4af37; border-radius: 12px; padding: 25px; text-align: center; margin: 30px 0;">
              <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Your Unique Profile ID</p>
              <h1 style="color: #722f37; margin: 0; font-size: 36px; letter-spacing: 4px; font-weight: bold;">${profileId}</h1>
              <p style="color: #888; margin: 15px 0 0 0; font-size: 13px;">
                Please save this ID for future reference
              </p>
            </div>
            <p style="color: #666; line-height: 1.6; margin: 25px 0;">
              You can use this Profile ID to:
            </p>
            <ul style="color: #666; line-height: 2; margin: 0 0 25px 0; padding-left: 20px;">
              <li>Identify yourself when contacting support</li>
              <li>Share with family members who are helping you search</li>
              <li>Quick login assistance</li>
            </ul>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app') || 'https://lakshmimatrimony.com'}/login" 
                 style="display: inline-block; background: linear-gradient(135deg, #722f37 0%, #8b4513 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Login to Your Account
              </a>
            </div>
          </div>
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p style="margin: 0;">© 2024 Lakshmi Matrimony. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">This website is strictly for matrimonial purpose only.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Lakshmi Matrimony <onboarding@resend.dev>",
        to: [email],
        subject: `Welcome to Lakshmi Matrimony - Your Profile ID: ${profileId}`,
        html: emailHtml,
      }),
    });

    const emailData = await emailResponse.json();
    
    if (!emailResponse.ok) {
      console.error("Resend API error:", emailData);
      throw new Error(emailData.message || "Failed to send email");
    }

    console.log("Welcome email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Welcome email sent successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
