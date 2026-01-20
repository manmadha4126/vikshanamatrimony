import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscriptionNotificationRequest {
  email: string;
  name: string;
  planName: string;
  amount: number;
  validityMonths: number;
  status: "approved" | "rejected";
  expiresAt?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, planName, amount, validityMonths, status, expiresAt }: SubscriptionNotificationRequest = await req.json();

    if (!email || !name || !planName || !status) {
      throw new Error("Missing required fields");
    }

    console.log(`Sending ${status} subscription notification to:`, email);

    const formatCurrency = (amt: number) => {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(amt);
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    };

    let emailHtml = "";
    let subject = "";

    if (status === "approved") {
      subject = `🎉 Your ${planName} Subscription is Now Active! - Vikshana Matrimony`;
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f9f5f2;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #722f37 0%, #8b4513 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Vikshana Matrimony</h1>
              <p style="color: #f0e6d3; margin: 10px 0 0 0; font-size: 14px;">Finding your perfect match</p>
            </div>
            <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 40px;">✓</span>
                </div>
                <h2 style="color: #10b981; margin: 0; font-size: 24px;">Payment Approved!</h2>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin: 0 0 25px 0;">
                Dear ${name},
              </p>
              <p style="color: #666; line-height: 1.6; margin: 0 0 25px 0;">
                Great news! Your payment for the <strong>${planName}</strong> subscription has been verified and approved. Your premium features are now active!
              </p>
              
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #10b981; border-radius: 12px; padding: 25px; margin: 30px 0;">
                <h3 style="color: #059669; margin: 0 0 15px 0; font-size: 18px;">Subscription Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Plan:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: bold; text-align: right;">${planName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Amount Paid:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: bold; text-align: right;">${formatCurrency(amount)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Validity:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: bold; text-align: right;">${validityMonths} Months</td>
                  </tr>
                  ${expiresAt ? `
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Valid Until:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: bold; text-align: right;">${formatDate(expiresAt)}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin: 25px 0;">
                You can now enjoy all premium features including:
              </p>
              <ul style="color: #666; line-height: 2; margin: 0 0 25px 0; padding-left: 20px;">
                <li>Unlimited profile views</li>
                <li>Send & receive unlimited interests</li>
                <li>Direct messaging with matches</li>
                <li>Priority customer support</li>
                <li>Advanced search filters</li>
              </ul>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://vikshanamatrimony.com/my-dashboard" 
                   style="display: inline-block; background: linear-gradient(135deg, #722f37 0%, #8b4513 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Start Exploring Matches
                </a>
              </div>
            </div>
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p style="margin: 0;">© 2024 Vikshana Matrimony. All rights reserved.</p>
              <p style="margin: 5px 0 0 0;">This website is strictly for matrimonial purpose only.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      subject = `Payment Update - ${planName} Subscription - Vikshana Matrimony`;
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f9f5f2;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #722f37 0%, #8b4513 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Vikshana Matrimony</h1>
              <p style="color: #f0e6d3; margin: 10px 0 0 0; font-size: 14px;">Finding your perfect match</p>
            </div>
            <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                  <span style="font-size: 40px;">!</span>
                </div>
                <h2 style="color: #ef4444; margin: 0; font-size: 24px;">Payment Could Not Be Verified</h2>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin: 0 0 25px 0;">
                Dear ${name},
              </p>
              <p style="color: #666; line-height: 1.6; margin: 0 0 25px 0;">
                We regret to inform you that your payment for the <strong>${planName}</strong> subscription could not be verified at this time.
              </p>
              
              <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border: 2px solid #ef4444; border-radius: 12px; padding: 25px; margin: 30px 0;">
                <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 18px;">Subscription Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Plan:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: bold; text-align: right;">${planName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Amount:</td>
                    <td style="padding: 8px 0; color: #333; font-weight: bold; text-align: right;">${formatCurrency(amount)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Status:</td>
                    <td style="padding: 8px 0; color: #dc2626; font-weight: bold; text-align: right;">Payment Rejected</td>
                  </tr>
                </table>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin: 25px 0;">
                This could happen due to:
              </p>
              <ul style="color: #666; line-height: 2; margin: 0 0 25px 0; padding-left: 20px;">
                <li>Payment not received in our account</li>
                <li>Transaction reference mismatch</li>
                <li>Incomplete payment information</li>
              </ul>
              
              <p style="color: #666; line-height: 1.6; margin: 25px 0;">
                If you believe this is an error or if you have already made the payment, please contact our support team with your payment receipt/screenshot.
              </p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="tel:+919686555839" 
                   style="display: inline-block; background: linear-gradient(135deg, #722f37 0%, #8b4513 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Contact Support
                </a>
              </div>
              <p style="color: #888; text-align: center; margin-top: 15px; font-size: 14px;">
                Or WhatsApp us at +91 96865 55839
              </p>
            </div>
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
              <p style="margin: 0;">© 2024 Vikshana Matrimony. All rights reserved.</p>
              <p style="margin: 5px 0 0 0;">This website is strictly for matrimonial purpose only.</p>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Vikshana Matrimony <onboarding@resend.dev>",
        to: [email],
        subject: subject,
        html: emailHtml,
      }),
    });

    const emailData = await emailResponse.json();
    
    if (!emailResponse.ok) {
      console.error("Resend API error:", emailData);
      throw new Error(emailData.message || "Failed to send email");
    }

    console.log("Subscription notification email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Subscription notification email sent successfully"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-subscription-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
