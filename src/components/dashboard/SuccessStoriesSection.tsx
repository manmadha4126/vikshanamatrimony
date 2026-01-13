import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Quote, Star, ChevronLeft, ChevronRight, Clock } from "lucide-react";
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
  status?: string;
  isOwnStory?: boolean;
}
interface SuccessStoriesSectionProps {
  userId?: string;
  userName?: string;
}

// Default stories to show when no approved stories exist
const defaultStories: SuccessStory[] = [{
  id: "1",
  coupleName: "Priya & Rahul",
  weddingDate: "March 2024",
  location: "Bangalore",
  story: "We found each other through Vikshana Matrimony and knew from our first conversation that we were meant to be together. Thank you for helping us find our perfect match!",
  imageUrl: undefined,
  weddingImageUrl: weddingHero1
}, {
  id: "2",
  coupleName: "Anitha & Karthik",
  weddingDate: "January 2024",
  location: "Chennai",
  story: "The partner preferences feature helped us find someone who shared our values and dreams. We are grateful for this wonderful platform that brought us together.",
  imageUrl: undefined,
  weddingImageUrl: weddingHero2
}, {
  id: "3",
  coupleName: "Sneha & Arun",
  weddingDate: "December 2023",
  location: "Hyderabad",
  story: "After months of searching, we finally found each other here. The assisted service team was incredibly helpful throughout our journey.",
  imageUrl: undefined,
  weddingImageUrl: weddingCarousel2
}];
const SuccessStoriesSection = ({
  userId,
  userName
}: SuccessStoriesSectionProps) => {
  const [stories, setStories] = useState<SuccessStory[]>(defaultStories);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const getInitials = (name: string) => {
    const names = name.split(" & ");
    return names.map(n => n[0]).join("&");
  };
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric"
    });
  };
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -320,
        behavior: "smooth"
      });
    }
  };
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const maxScroll = container.scrollWidth - container.clientWidth;

      // If at the end, scroll back to start
      if (container.scrollLeft >= maxScroll - 10) {
        container.scrollTo({
          left: 0,
          behavior: "smooth"
        });
      } else {
        container.scrollBy({
          left: 320,
          behavior: "smooth"
        });
      }
    }
  };

  // Auto-scroll effect
  useEffect(() => {
    if (loading || isPaused || stories.length <= 1) return;
    const interval = setInterval(() => {
      scrollRight();
    }, 4000);
    return () => clearInterval(interval);
  }, [loading, isPaused, stories.length]);
  const fetchApprovedStories = async () => {
    try {
      // Fetch approved stories from all users
      const {
        data: approvedData,
        error: approvedError
      } = await supabase.from("success_stories").select("*").eq("status", "approved").order("approved_at", {
        ascending: false
      }).limit(10);
      if (approvedError) throw approvedError;

      // Fetch current user's own stories (including pending)
      let userStories: typeof approvedData = [];
      if (userId) {
        const {
          data: userData,
          error: userError
        } = await supabase.from("success_stories").select("*").eq("user_id", userId).order("created_at", {
          ascending: false
        });
        if (!userError && userData) {
          userStories = userData;
        }
      }

      // Combine and deduplicate stories
      const allStoriesData = [...(userStories || [])];
      approvedData?.forEach(story => {
        if (!allStoriesData.find(s => s.id === story.id)) {
          allStoriesData.push(story);
        }
      });
      if (allStoriesData.length > 0) {
        // Fetch user names for the stories
        const userIds = allStoriesData.map(s => s.user_id);
        const {
          data: profilesData
        } = await supabase.from("profiles").select("user_id, name").in("user_id", userIds);
        const weddingImages = [weddingHero1, weddingHero2, weddingCarousel2];
        const formattedStories: SuccessStory[] = allStoriesData.map((s, index) => {
          const profile = profilesData?.find(p => p.user_id === s.user_id);
          return {
            id: s.id,
            coupleName: `${profile?.name || "Anonymous"} & ${s.partner_name}`,
            weddingDate: formatDate(s.wedding_date),
            location: s.wedding_location,
            story: s.story,
            imageUrl: s.photo_url || undefined,
            weddingImageUrl: s.photo_url || weddingImages[index % weddingImages.length],
            status: s.status,
            isOwnStory: s.user_id === userId
          };
        });

        // Put user's own stories first, then approved stories, then default stories
        const sortedStories = formattedStories.sort((a, b) => {
          if (a.isOwnStory && !b.isOwnStory) return -1;
          if (!a.isOwnStory && b.isOwnStory) return 1;
          return 0;
        });
        setStories([...sortedStories, ...defaultStories]);
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
  }, [userId]);
  return <Card>
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
            {userId && userName && <ShareYourStoryForm userId={userId} userName={userName} />}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div> : <>
            <div className="relative">
              {/* Navigation Buttons */}
              <Button variant="outline" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm shadow-md hidden md:flex" onClick={scrollLeft}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 backdrop-blur-sm shadow-md hidden md:flex" onClick={scrollRight}>
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* Scrollable Stories Container */}
              <div ref={scrollContainerRef} className="overflow-x-auto pb-4 px-1 scroll-smooth scrollbar-hide md:px-10 flex-row gap-[16px] border-4 rounded-3xl shadow-2xl opacity-100 border-double flex items-center justify-center" style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none"
          }} onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} onTouchStart={() => setIsPaused(true)} onTouchEnd={() => setIsPaused(false)}>
                {stories.map(story => <Card key={story.id} className="relative overflow-hidden group hover:shadow-lg transition-shadow flex-shrink-0 w-[300px]">
                    {/* Wedding Image */}
                    {story.weddingImageUrl && <div className="relative h-40 overflow-hidden">
                        <img src={story.weddingImageUrl} alt={`${story.coupleName} wedding`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-2 left-3 right-3">
                          <h3 className="font-semibold text-white text-lg">{story.coupleName}</h3>
                          <p className="text-xs text-white/80">
                            {story.weddingDate} • {story.location}
                          </p>
                        </div>
                      </div>}
                    
                    {/* Status Badge for user's own pending stories */}
                    {story.isOwnStory && story.status === "pending" && <div className="absolute top-3 left-3 z-10">
                        <Badge variant="secondary" className="bg-amber-500/90 text-white border-0 gap-1">
                          <Clock className="h-3 w-3" />
                          Pending Approval
                        </Badge>
                      </div>}
                    
                    {story.isOwnStory && story.status === "approved" && <div className="absolute top-3 left-3 z-10">
                        <Badge variant="secondary" className="bg-green-500/90 text-white border-0">
                          Your Story
                        </Badge>
                      </div>}
                    
                    <div className="absolute top-3 right-3 z-10">
                      <Quote className="h-8 w-8 text-white/30" />
                    </div>
                    
                    <CardContent className={story.weddingImageUrl ? "pt-4" : "pt-6"}>
                      {!story.weddingImageUrl && <div className="flex items-center gap-3 mb-4">
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
                        </div>}
                      
                      <div className="relative">
                        <p className="text-sm text-muted-foreground italic leading-relaxed line-clamp-3">
                          &quot;{story.story}&quot;
                        </p>
                      </div>

                      <div className="flex items-center gap-1 mt-4">
                        {[1, 2, 3, 4, 5].map(star => <Star key={star} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                      </div>
                    </CardContent>
                  </Card>)}
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Join thousands of happy couples who found their soulmate with us
              </p>
            </div>
          </>}
      </CardContent>
    </Card>;
};
export default SuccessStoriesSection;