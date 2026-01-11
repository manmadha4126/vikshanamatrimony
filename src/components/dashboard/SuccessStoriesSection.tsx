import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, Quote, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ShareYourStoryForm from "./ShareYourStoryForm";
import weddingHero1 from "@/assets/wedding-hero-1.jpg";
import weddingHero2 from "@/assets/wedding-hero-2.jpg";
import weddingCarousel2 from "@/assets/wedding-carousel-2.jpg";

interface SuccessStory {
  id: string;
  coupleName: string;
  weddingDate: string;
  location: string;
  story: string;
  imageUrl?: string;
  weddingImageUrl?: string;
}

interface SuccessStoriesSectionProps {
  userId?: string;
  userName?: string;
}

// Default stories to show when no approved stories exist
const defaultStories: SuccessStory[] = [
  {
    id: "1",
    coupleName: "Priya & Rahul",
    weddingDate: "March 2024",
    location: "Bangalore",
    story: "We found each other through Vikshana Matrimony and knew from our first conversation that we were meant to be together. Thank you for helping us find our perfect match!",
    imageUrl: undefined,
    weddingImageUrl: weddingHero1,
  },
  {
    id: "2",
    coupleName: "Anitha & Karthik",
    weddingDate: "January 2024",
    location: "Chennai",
    story: "The partner preferences feature helped us find someone who shared our values and dreams. We are grateful for this wonderful platform that brought us together.",
    imageUrl: undefined,
    weddingImageUrl: weddingHero2,
  },
  {
    id: "3",
    coupleName: "Sneha & Arun",
    weddingDate: "December 2023",
    location: "Hyderabad",
    story: "After months of searching, we finally found each other here. The assisted service team was incredibly helpful throughout our journey.",
    imageUrl: undefined,
    weddingImageUrl: weddingCarousel2,
  },
];

const SuccessStoriesSection = ({ userId, userName }: SuccessStoriesSectionProps) => {
  const [stories, setStories] = useState<SuccessStory[]>(defaultStories);
  const [loading, setLoading] = useState(true);

  const getInitials = (name: string) => {
    const names = name.split(" & ");
    return names.map(n => n[0]).join("&");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const fetchApprovedStories = async () => {
    try {
      const { data, error } = await supabase
        .from("success_stories")
        .select("*")
        .eq("status", "approved")
        .order("approved_at", { ascending: false })
        .limit(6);

      if (error) throw error;

      if (data && data.length > 0) {
        // Fetch user names for the stories
        const userIds = data.map(s => s.user_id);
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("user_id, name")
          .in("user_id", userIds);

        const weddingImages = [weddingHero1, weddingHero2, weddingCarousel2];
        const formattedStories: SuccessStory[] = data.map((s, index) => {
          const profile = profilesData?.find(p => p.user_id === s.user_id);
          return {
            id: s.id,
            coupleName: `${profile?.name || "Anonymous"} & ${s.partner_name}`,
            weddingDate: formatDate(s.wedding_date),
            location: s.wedding_location,
            story: s.story,
            imageUrl: s.photo_url || undefined,
            weddingImageUrl: s.photo_url || weddingImages[index % weddingImages.length],
          };
        });

        setStories(formattedStories.length > 0 ? formattedStories : defaultStories);
      }
    } catch (error) {
      console.error("Error fetching stories:", error);
      // Keep default stories on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedStories();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary fill-primary" />
              Success Stories
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Real couples who found love through Vikshana Matrimony
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              1000+ Marriages
            </Badge>
            {userId && userName && (
              <ShareYourStoryForm userId={userId} userName={userName} />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stories.slice(0, 3).map((story) => (
                <Card key={story.id} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                  {/* Wedding Image */}
                  {story.weddingImageUrl && (
                    <div className="relative h-40 overflow-hidden">
                      <img 
                        src={story.weddingImageUrl} 
                        alt={`${story.coupleName} wedding`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-2 left-3 right-3">
                        <h3 className="font-semibold text-white text-lg">{story.coupleName}</h3>
                        <p className="text-xs text-white/80">
                          {story.weddingDate} • {story.location}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute top-3 right-3 z-10">
                    <Quote className="h-8 w-8 text-white/30" />
                  </div>
                  
                  <CardContent className={story.weddingImageUrl ? "pt-4" : "pt-6"}>
                    {!story.weddingImageUrl && (
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-14 w-14 border-2 border-primary/20">
                          <AvatarImage src={story.imageUrl} />
                          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold">
                            {getInitials(story.coupleName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-foreground">{story.coupleName}</h3>
                          <p className="text-xs text-muted-foreground">
                            {story.weddingDate} • {story.location}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="relative">
                      <p className="text-sm text-muted-foreground italic leading-relaxed line-clamp-3">
                        &quot;{story.story}&quot;
                      </p>
                    </div>

                    <div className="flex items-center gap-1 mt-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="h-4 w-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Join thousands of happy couples who found their soulmate with us
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SuccessStoriesSection;
