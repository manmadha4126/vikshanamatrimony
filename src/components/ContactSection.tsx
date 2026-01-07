import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
const ContactSection = () => {
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent!",
      description: "Thank you for reaching out. We'll get back to you soon."
    });
    setFormData({
      name: "",
      email: "",
      phone: "",
      message: ""
    });
  };
  return <section id="contact" className="py-16 bg-background">
      <div className="container">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
            Get In Touch
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Contact <span className="text-primary">Us</span>
          </h2>
          <p className="text-muted-foreground">
            Have questions? We'd love to hear from you. Send us a message and 
            we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Contact Form */}
          <div className="bg-card rounded-xl shadow-card p-6 border border-border/50">
            <h3 className="font-display text-xl font-bold text-foreground mb-4">
              Send Us a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="contact-name" className="text-sm">Full Name</Label>
                <Input id="contact-name" type="text" placeholder="Enter your name" value={formData.name} onChange={e => setFormData({
                ...formData,
                name: e.target.value
              })} required className="h-10" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contact-email" className="text-sm">Email Address</Label>
                <Input id="contact-email" type="email" placeholder="Enter your email" value={formData.email} onChange={e => setFormData({
                ...formData,
                email: e.target.value
              })} required className="h-10" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contact-phone" className="text-sm">Phone Number</Label>
                <Input id="contact-phone" type="tel" placeholder="+91 98765 43210" value={formData.phone} onChange={e => setFormData({
                ...formData,
                phone: e.target.value
              })} className="h-10" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contact-message" className="text-sm">Your Message</Label>
                <Textarea id="contact-message" placeholder="How can we help you?" value={formData.message} onChange={e => setFormData({
                ...formData,
                message: e.target.value
              })} required className="min-h-[100px] resize-none" />
              </div>

              <Button type="submit" variant="primary" className="w-full">
                Send Message
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            {/* Office Info Card */}
            <div className="bg-card rounded-xl shadow-card p-6 border border-border/50">
              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                Our Office
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm mb-0.5">Address</h4>
                    <p className="text-muted-foreground text-xs">​Pillar No 44, 20-1-244, Korlagunta junction, Tirupati Bypass road
Tirupati, Andhra Pradesh - 517501
India<br />
                      Tirupati, AndhraPradesh        <br />
                      India
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm mb-0.5">Phone</h4>
                    <p className="text-muted-foreground text-xs">+91 9491449044
                    <br />
                      +91 9100090883   
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm mb-0.5">Email</h4>
                    <p className="text-muted-foreground text-xs">info@vikshanamatrimony.com<br />
                      ​
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm mb-0.5">Working Hours</h4>
                    <p className="text-muted-foreground text-xs">Monday - Saturday: 10:00 AM - 7:00 PM
Sunday: Holiday<br />
                      Sunday: 10:00 AM - 5:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Card */}
            <div className="bg-card rounded-xl shadow-card p-6 border border-border/50">
              <h3 className="font-display text-lg font-bold text-foreground mb-3">
                Connect With Us
              </h3>
              <p className="text-muted-foreground text-xs mb-4">
                Follow us on social media for updates, success stories, and more.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Facebook size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                  <Instagram size={18} />
                </a>
                <a href="#" className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                  <MessageCircle size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default ContactSection;