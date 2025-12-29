import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Heart, Send, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const storySchema = z.object({
  partnerName: z
    .string()
    .trim()
    .min(2, { message: "Partner name must be at least 2 characters" })
    .max(100, { message: "Partner name must be less than 100 characters" }),
  weddingDate: z.string().min(1, { message: "Wedding date is required" }),
  weddingLocation: z
    .string()
    .trim()
    .min(2, { message: "Location must be at least 2 characters" })
    .max(100, { message: "Location must be less than 100 characters" }),
  story: z
    .string()
    .trim()
    .min(50, { message: "Please share at least 50 characters about your story" })
    .max(1000, { message: "Story must be less than 1000 characters" }),
});

type StoryFormValues = z.infer<typeof storySchema>;

interface ShareYourStoryFormProps {
  userId: string;
  userName: string;
}

const ShareYourStoryForm = ({ userId, userName }: ShareYourStoryFormProps) => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const form = useForm<StoryFormValues>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      partnerName: "",
      weddingDate: "",
      weddingLocation: "",
      story: "",
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Photo must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      setPhotoFile(file);
    }
  };

  const onSubmit = async (values: StoryFormValues) => {
    setIsSubmitting(true);
    try {
      let photoUrl = null;

      // Upload photo if provided
      if (photoFile) {
        const fileExt = photoFile.name.split(".").pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("profile-photos")
          .upload(`success-stories/${fileName}`, photoFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("profile-photos")
          .getPublicUrl(`success-stories/${fileName}`);

        photoUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("success_stories").insert({
        user_id: userId,
        partner_name: values.partnerName,
        wedding_date: values.weddingDate,
        wedding_location: values.weddingLocation,
        story: values.story,
        photo_url: photoUrl,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Thank you for sharing your story! It will be reviewed and published soon.");
      setOpen(false);
      form.reset();
      setPhotoFile(null);
    } catch (error) {
      console.error("Error submitting story:", error);
      toast.error("Failed to submit your story. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Heart className="h-4 w-4" />
          Share Your Story
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary fill-primary" />
            Share Your Success Story
          </DialogTitle>
          <DialogDescription>
            Found your soulmate through Vikshana Matrimony? Share your journey to inspire others!
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Your Name</Label>
                <Input value={userName} disabled className="bg-muted" />
              </div>
              <FormField
                control={form.control}
                name="partnerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partner's Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter partner's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weddingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wedding Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weddingLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wedding Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="story"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Love Story</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us how you met, what made you fall in love, and your journey to marriage..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <FormMessage />
                    <span>{field.value.length}/1000</span>
                  </div>
                </FormItem>
              )}
            />

            <div>
              <Label>Wedding Photo (Optional)</Label>
              <div className="mt-1.5">
                <label
                  htmlFor="photo-upload"
                  className="flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {photoFile ? photoFile.name : "Click to upload a photo"}
                  </span>
                </label>
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Max 5MB, JPG/PNG</p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Story
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ShareYourStoryForm;
