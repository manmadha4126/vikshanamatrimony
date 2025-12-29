import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, Quote, Star } from "lucide-react";

interface SuccessStory {
  id: string;
  coupleName: string;
  weddingDate: string;
  location: string;
  story: string;
  imageUrl?: string;
}

const successStories: SuccessStory[] = [
  {
    id: "1",
    coupleName: "Priya & Rahul",
    weddingDate: "March 2024",
    location: "Bangalore",
    story: "We found each other through Vikshana Matrimony and knew from our first conversation that we were meant to be together. Thank you for helping us find our perfect match!",
    imageUrl: undefined,
  },
  {
    id: "2",
    coupleName: "Anitha & Karthik",
    weddingDate: "January 2024",
    location: "Chennai",
    story: "The partner preferences feature helped us find someone who shared our values and dreams. We are grateful for this wonderful platform that brought us together.",
    imageUrl: undefined,
  },
  {
    id: "3",
    coupleName: "Sneha & Arun",
    weddingDate: "December 2023",
    location: "Hyderabad",
    story: "After months of searching, we finally found each other here. The assisted service team was incredibly helpful throughout our journey.",
    imageUrl: undefined,
  },
];

const SuccessStoriesSection = () => {
  const getInitials = (name: string) => {
    const names = name.split(" & ");
    return names.map(n => n[0]).join("&");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary fill-primary" />
              Success Stories
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Real couples who found love through Vikshana Matrimony
            </p>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            1000+ Marriages
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {successStories.map((story) => (
            <Card key={story.id} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="absolute top-3 right-3">
                <Quote className="h-8 w-8 text-primary/10" />
              </div>
              <CardContent className="pt-6">
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
                
                <div className="relative">
                  <p className="text-sm text-muted-foreground italic leading-relaxed line-clamp-4">
                    "{story.story}"
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
      </CardContent>
    </Card>
  );
};

export default SuccessStoriesSection;
