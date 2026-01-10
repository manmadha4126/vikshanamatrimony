import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.87.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    if (claimsError || !claimsData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    const userId = claimsData.user.id;

    const { messages } = await req.json();

    // Fetch user's profile
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Fetch user's partner preferences
    const { data: preferences } = await supabase
      .from('partner_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Fetch potential matches (opposite gender, complete profiles)
    const oppositeGender = userProfile?.gender === 'Male' ? 'Female' : 'Male';
    const { data: potentialMatches } = await supabase
      .from('profiles')
      .select('id, name, profile_id, date_of_birth, height, education, occupation, city, state, religion, caste, marital_status, about_me, annual_income')
      .eq('gender', oppositeGender)
      .eq('is_complete', true)
      .limit(50);

    // Calculate age for each profile
    const matchesWithAge = (potentialMatches || []).map(profile => {
      let age = null;
      if (profile.date_of_birth) {
        const today = new Date();
        const birth = new Date(profile.date_of_birth);
        age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
          age--;
        }
      }
      return { ...profile, age };
    });

    const systemPrompt = `You are Vikshana, a friendly and helpful AI matchmaking assistant for Vikshana Matrimony. Your role is to help users find their perfect life partner.

You have access to the user's profile and preferences, as well as potential matches from the database.

**User's Profile:**
${JSON.stringify(userProfile, null, 2)}

**User's Partner Preferences:**
${JSON.stringify(preferences, null, 2)}

**Available Matches (${matchesWithAge.length} profiles):**
${JSON.stringify(matchesWithAge, null, 2)}

**Guidelines:**
1. Be warm, respectful, and culturally sensitive - this is about marriage, a sacred bond.
2. When recommending matches, explain WHY they might be compatible based on preferences and profile details.
3. You can filter and recommend profiles based on the user's criteria (age, religion, education, location, etc.).
4. If asked about specific profiles, provide detailed insights about compatibility.
5. Encourage users to look beyond just basic criteria and consider values, interests, and compatibility.
6. Never reveal sensitive personal information like exact addresses or phone numbers.
7. Keep responses concise but helpful. Use bullet points for listing multiple matches.
8. If users ask about features or actions (like sending interest), guide them to use the app's buttons.
9. Address the user by their first name when appropriate.
10. If no matches fit their criteria, suggest broadening their preferences.

Remember: You're helping people find their life partner - be thoughtful, positive, and encouraging!`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service quota exceeded. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("match-assistant error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
