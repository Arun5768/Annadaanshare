import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Sidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { User, User as SelectUser } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMobile } from "@/hooks/use-mobile";
import {
  Award,
  Camera,
  Edit2,
  Heart,
  Mail,
  MapPin,
  Phone,
  Save,
  User as UserIcon,
} from "lucide-react";

// Profile update schema
const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  bio: z.string().optional(),
  avatar: z.string().optional(),
});

type ProfileUpdateValues = z.infer<typeof profileUpdateSchema>;

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile);
  const [editMode, setEditMode] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Form setup
  const form = useForm<ProfileUpdateValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
      city: user?.city || "",
      bio: user?.bio || "",
      avatar: user?.avatar || "",
    },
  });

  // Handle avatar upload
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload this to a server/CDN
      // For this example, we'll use a local URL
      const fileUrl = URL.createObjectURL(file);
      setAvatarPreview(fileUrl);
      form.setValue("avatar", fileUrl);
    }
  };

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return await res.json();
    },
    onSuccess: (updatedUser: SelectUser) => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      // Update user data in cache
      queryClient.setQueryData(["/api/user"], updatedUser);
      setEditMode(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update profile",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission
  const onSubmit = (values: ProfileUpdateValues) => {
    updateProfileMutation.mutate(values);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Profile Not Available</CardTitle>
              <CardDescription>
                Please log in to view your profile.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full">
                <a href="/auth">Go to Login</a>
              </Button>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar for desktop */}
      {!isMobile && (
        <Sidebar isCollapsed={sidebarCollapsed} className="hidden md:flex" />
      )}

      <div className="flex-1">
        <Header />

        <main className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-poppins font-bold">My Profile</h1>
            {!editMode ? (
              <Button
                variant="outline"
                onClick={() => setEditMode(true)}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setEditMode(false);
                  form.reset({
                    name: user.name,
                    email: user.email,
                    phone: user.phone || "",
                    address: user.address || "",
                    city: user.city || "",
                    bio: user.bio || "",
                    avatar: user.avatar || "",
                  });
                  setAvatarPreview(null);
                }}
              >
                Cancel
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left column: Profile info */}
            <div className="md:col-span-1">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    {editMode ? (
                      <div className="mb-4 relative group">
                        <Avatar className="h-24 w-24 border-2 border-primary">
                          <AvatarImage
                            src={avatarPreview || user.avatar}
                            alt={user.name}
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                            {user.name[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="avatar-upload"
                            onChange={handleAvatarUpload}
                          />
                          <label
                            htmlFor="avatar-upload"
                            className="cursor-pointer text-white"
                          >
                            <Camera className="h-6 w-6" />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <Avatar className="h-24 w-24 mb-4 border-2 border-primary">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                          {user.name[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <h2 className="text-xl font-bold mb-1">{user.name}</h2>
                    <p className="text-muted-foreground text-sm mb-3">
                      @{user.username}
                    </p>

                    <div className="flex items-center mb-4">
                      <Badge
                        variant="outline"
                        className="flex items-center bg-primary/10 text-primary"
                      >
                        <Award className="mr-1 h-3 w-3" />
                        {user.karmaPoints || 0} Karma Points
                      </Badge>
                    </div>

                    {!editMode && (
                      <>
                        <Separator className="my-4" />

                        <div className="w-full space-y-3">
                          {user.email && (
                            <div className="flex items-start">
                              <Mail className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                              <div>
                                <p className="text-sm font-medium">Email</p>
                                <p className="text-sm text-muted-foreground">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          )}

                          {user.phone && (
                            <div className="flex items-start">
                              <Phone className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                              <div>
                                <p className="text-sm font-medium">Phone</p>
                                <p className="text-sm text-muted-foreground">
                                  {user.phone}
                                </p>
                              </div>
                            </div>
                          )}

                          {(user.address || user.city) && (
                            <div className="flex items-start">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 mr-2" />
                              <div>
                                <p className="text-sm font-medium">Location</p>
                                <p className="text-sm text-muted-foreground">
                                  {[user.address, user.city]
                                    .filter(Boolean)
                                    .join(", ")}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {user.bio && (
                          <>
                            <Separator className="my-4" />
                            <div className="w-full">
                              <h3 className="text-sm font-medium mb-2">Bio</h3>
                              <p className="text-sm text-muted-foreground">
                                {user.bio}
                              </p>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {!editMode && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <Heart className="h-4 w-4 mr-2 text-primary" />
                      About Annadaan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Annadaan is the sacred act of donating food, considered one
                      of the highest forms of charity in Indian culture.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your participation helps reduce food waste while honoring
                      this centuries-old tradition of generosity and community
                      care.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right column: Edit form or activity */}
            <div className="md:col-span-2">
              {editMode ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Edit Profile</CardTitle>
                    <CardDescription>
                      Update your personal information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                      >
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="john@example.com"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="+91 98765 43210"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="Mumbai" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="123 Main St, Apartment 4B"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bio</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Tell us a bit about yourself"
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end">
                          <Button
                            type="submit"
                            disabled={updateProfileMutation.isPending}
                          >
                            {updateProfileMutation.isPending ? (
                              "Saving..."
                            ) : (
                              <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              ) : (
                <Tabs defaultValue="activity" className="h-full">
                  <TabsList>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                    <TabsTrigger value="achievements">Achievements</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="activity" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                          Your recent contributions and interactions
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[400px] pr-4">
                          <div className="space-y-4">
                            <ActivityItem
                              title="Food Donated"
                              description="You shared homemade vegetable curry with the community."
                              date="2 days ago"
                              icon={<Heart className="h-4 w-4 text-primary" />}
                            />
                            <ActivityItem
                              title="Karma Points Earned"
                              description="You received 5 karma points for your donation."
                              date="2 days ago"
                              icon={<Award className="h-4 w-4 text-primary" />}
                            />
                            <ActivityItem
                              title="Profile Updated"
                              description="You updated your profile information."
                              date="1 week ago"
                              icon={<UserIcon className="h-4 w-4 text-primary" />}
                            />
                            <ActivityItem
                              title="New Listing Created"
                              description="You created a new food listing: Fresh bread & pastries."
                              date="2 weeks ago"
                              icon={<Heart className="h-4 w-4 text-primary" />}
                            />
                            <ActivityItem
                              title="Karma Points Earned"
                              description="You received 5 karma points for your donation."
                              date="2 weeks ago"
                              icon={<Award className="h-4 w-4 text-primary" />}
                            />
                            <ActivityItem
                              title="Joined Annadaan Connect"
                              description="Welcome to the community! You've joined the movement to reduce food waste and share with those in need."
                              date="1 month ago"
                              icon={<UserIcon className="h-4 w-4 text-primary" />}
                            />
                          </div>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="achievements" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Achievements</CardTitle>
                        <CardDescription>
                          Milestones and badges earned
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <AchievementCard
                            title="First Donation"
                            description="You made your first food donation"
                            icon={<Heart className="h-6 w-6 text-primary" />}
                            earned={true}
                          />
                          <AchievementCard
                            title="Regular Donor"
                            description="Make at least 5 donations"
                            icon={<Heart className="h-6 w-6 text-primary" />}
                            earned={false}
                            progress={2}
                            total={5}
                          />
                          <AchievementCard
                            title="Community Pillar"
                            description="Earn 50 karma points through donations"
                            icon={<Award className="h-6 w-6 text-primary" />}
                            earned={false}
                            progress={user.karmaPoints || 0}
                            total={50}
                          />
                          <AchievementCard
                            title="Verified Profile"
                            description="Complete your profile information"
                            icon={<UserIcon className="h-6 w-6 text-primary" />}
                            earned={
                              !!user.email &&
                              !!user.phone &&
                              !!user.address &&
                              !!user.city &&
                              !!user.bio
                            }
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4 mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Account Settings</CardTitle>
                        <CardDescription>
                          Manage your account preferences
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-medium">Notification Preferences</h3>
                          <p className="text-sm text-muted-foreground">
                            Configure how and when you receive notifications.
                          </p>
                          <Button variant="outline" className="mt-2">
                            Manage Notifications
                          </Button>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <h3 className="font-medium">Privacy Settings</h3>
                          <p className="text-sm text-muted-foreground">
                            Control what information is visible to other users.
                          </p>
                          <Button variant="outline" className="mt-2">
                            Manage Privacy
                          </Button>
                        </div>
                        
                        <Separator />
                        
                        <div className="space-y-2">
                          <h3 className="font-medium">Account Security</h3>
                          <p className="text-sm text-muted-foreground">
                            Update your password and secure your account.
                          </p>
                          <Button variant="outline" className="mt-2">
                            Change Password
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

// Activity Item Component
interface ActivityItemProps {
  title: string;
  description: string;
  date: string;
  icon: React.ReactNode;
}

const ActivityItem = ({ title, description, date, icon }: ActivityItemProps) => {
  return (
    <div className="flex">
      <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{title}</h4>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

// Achievement Card Component
interface AchievementCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  progress?: number;
  total?: number;
}

const AchievementCard = ({
  title,
  description,
  icon,
  earned,
  progress,
  total,
}: AchievementCardProps) => {
  return (
    <div className={`bg-card border rounded-lg p-4 ${earned ? "border-primary/50" : "border-muted"}`}>
      <div className="flex items-start">
        <div className={`mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${earned ? "bg-primary/20" : "bg-muted"}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center">
            <h4 className="font-medium">{title}</h4>
            {earned && (
              <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                Earned
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{description}</p>
          
          {progress !== undefined && total !== undefined && (
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{width: `${Math.min(100, (progress / total) * 100)}%`}}
              ></div>
              <p className="text-xs text-muted-foreground mt-1">
                {progress} of {total} completed
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
