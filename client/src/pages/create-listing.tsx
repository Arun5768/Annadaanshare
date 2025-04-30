import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Camera, Clock, Info, MapPin } from "lucide-react";
import { insertFoodListingSchema, InsertFoodListing } from "@shared/schema";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Extended schema with validations for forms
const foodListingFormSchema = insertFoodListingSchema.extend({
  expiryTime: z.date({
    required_error: "Expiry time is required",
  }).refine(date => date > new Date(), {
    message: "Expiry time must be in the future",
  }),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type CreateListingFormValues = z.infer<typeof foodListingFormSchema>;

const CreateListing = () => {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form with validation
  const form = useForm<CreateListingFormValues>({
    resolver: zodResolver(foodListingFormSchema),
    defaultValues: {
      title: "",
      description: "",
      quantity: "",
      type: "veg",
      isFree: true,
      suggestedPrice: 0,
      imageUrl: "",
      location: "",
      latitude: 0,
      longitude: 0,
      expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to 24 hours from now
    },
  });

  const isFree = form.watch("isFree");

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload this to a server/CDN
      // For this example, we'll use a local URL
      const fileUrl = URL.createObjectURL(file);
      setImagePreview(fileUrl);
      form.setValue("imageUrl", fileUrl);
    }
  };

  // Create food listing mutation
  const createListingMutation = useMutation({
    mutationFn: async (data: InsertFoodListing) => {
      const res = await apiRequest("POST", "/api/listings", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Listing created",
        description: "Your food listing has been created successfully.",
      });
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/user/listings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      // Navigate to the listing page
      navigate(`/listing/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create listing",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission
  const onSubmit = (values: CreateListingFormValues) => {
    // In a real app, you'd get these from geolocation API
    const locationData = {
      latitude: 12.9716,  // Example: Bangalore
      longitude: 77.5946,
    };

    const listingData = {
      ...values,
      ...locationData,
      // Convert suggestedPrice from rupees to paise
      suggestedPrice: values.suggestedPrice ? values.suggestedPrice * 100 : 0,
    };

    createListingMutation.mutate(listingData);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-poppins font-bold mb-2">Share Your Food</h1>
              <p className="text-muted-foreground">
                Fill out the form below to share your excess food with your community.
              </p>
            </div>

            <div className="bg-card rounded-lg shadow-sm p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-medium font-poppins">Basic Information</h2>
                    
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Food Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Homemade Vegetable Curry" {...field} />
                          </FormControl>
                          <FormDescription>
                            Give a clear title describing the food you're sharing.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the food, how it was prepared, ingredients, etc."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Provide details about the food, including any allergens.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., 2 servings, 500g, etc."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Food Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select food type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="veg">Vegetarian</SelectItem>
                                <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                                <SelectItem value="vegan">Vegan</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Price Options */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-medium font-poppins">Price Options</h2>
                    
                    <FormField
                      control={form.control}
                      name="isFree"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Free Donation</FormLabel>
                            <FormDescription>
                              Toggle this if you're offering the food for free.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {!isFree && (
                      <FormField
                        control={form.control}
                        name="suggestedPrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Suggested Price (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                placeholder="Enter amount in rupees"
                              />
                            </FormControl>
                            <FormDescription>
                              Suggest a fair price for your food (recipients can pay what they can afford).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>

                  <Separator />

                  {/* Image Upload */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-medium font-poppins">Food Image</h2>
                    
                    <div className="rounded-lg border border-dashed p-8 text-center">
                      {imagePreview ? (
                        <div className="space-y-4">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="mx-auto rounded-md max-h-[200px]"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setImagePreview(null);
                              form.setValue("imageUrl", "");
                            }}
                          >
                            Remove Image
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Camera className="h-10 w-10 text-muted-foreground mx-auto" />
                          <h3 className="text-lg font-medium">Upload Food Image</h3>
                          <p className="text-sm text-muted-foreground">
                            Upload a clear image of the food you're sharing
                          </p>
                          <Input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="food-image"
                            onChange={handleImageUpload}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            asChild
                          >
                            <label htmlFor="food-image" className="cursor-pointer">
                              Select Image
                            </label>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Location and Time */}
                  <div className="space-y-4">
                    <h2 className="text-xl font-medium font-poppins">Location & Expiry</h2>
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pickup Location</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                  placeholder="Enter your address or location"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                              <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => {
                                  // In a real app, this would get the user's current location
                                  form.setValue("location", "Bengaluru, Karnataka, India");
                                }}
                              >
                                Use Current
                              </Button>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Enter the address where the food can be picked up.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expiryTime"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Expiry Time</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP p")
                                  ) : (
                                    <span>Select date and time</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={(date) => {
                                  if (date) {
                                    // Preserve the time part
                                    const newDate = new Date(date);
                                    const oldDate = new Date(field.value);
                                    newDate.setHours(oldDate.getHours());
                                    newDate.setMinutes(oldDate.getMinutes());
                                    field.onChange(newDate);
                                  }
                                }}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                              <div className="p-3 border-t">
                                <div className="flex items-center">
                                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span className="text-sm">Time:</span>
                                  <Input
                                    type="time"
                                    className="ml-2"
                                    defaultValue={format(field.value, "HH:mm")}
                                    onChange={(e) => {
                                      const [hours, minutes] = e.target.value.split(':').map(Number);
                                      const newDate = new Date(field.value);
                                      newDate.setHours(hours);
                                      newDate.setMinutes(minutes);
                                      field.onChange(newDate);
                                    }}
                                  />
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            Set the date and time until when the food will be available.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Disclaimer */}
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex">
                      <Info className="h-5 w-5 text-muted-foreground mt-0.5 mr-2 flex-shrink-0" />
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium mb-1">Food Safety Disclaimer</p>
                        <p>
                          By sharing food, you confirm that it has been prepared
                          and stored following proper food safety guidelines.
                          Please ensure the food is fresh and safe for
                          consumption.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={createListingMutation.isPending}
                  >
                    {createListingMutation.isPending ? "Creating Listing..." : "Create Food Listing"}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateListing;
