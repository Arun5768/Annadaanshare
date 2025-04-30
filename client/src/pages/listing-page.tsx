import React, { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { FoodListing, Transaction } from "@shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  BarChart, 
  ChevronLeft, 
  Tag, 
  AlertTriangle,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  Info,
  Heart
} from "lucide-react";
import { Link } from "wouter";

const ListingPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentAmount, setPaymentAmount] = useState("");
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  
  // Fetch food listing details
  const { data: listing, isLoading } = useQuery<FoodListing>({
    queryKey: [`/api/listings/${id}`],
    enabled: !!id,
  });
  
  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: async (data: { listingId: number, donorId: number, amountPaid?: number }) => {
      const res = await apiRequest("POST", "/api/transactions", data);
      return await res.json();
    },
    onSuccess: (data: Transaction) => {
      toast({
        title: "Request sent successfully",
        description: "The donor has been notified of your request.",
      });
      setShowRequestDialog(false);
      queryClient.invalidateQueries({ queryKey: [`/api/listings/${id}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to send request",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle request food
  const handleRequestFood = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to request food.",
        variant: "destructive",
      });
      return;
    }
    
    if (!listing) return;
    
    const transactionData = {
      listingId: listing.id,
      donorId: listing.userId,
      amountPaid: !listing.isFree && paymentAmount ? parseInt(paymentAmount) * 100 : 0, // Convert to paise
    };
    
    createTransactionMutation.mutate(transactionData);
  };
  
  // Format date
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Loading food listing details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Listing Not Found</CardTitle>
              <CardDescription>
                The food listing you're looking for doesn't exist or has been removed.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href="/browse">
                <a>
                  <Button>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Browse Other Listings
                  </Button>
                </a>
              </Link>
            </CardFooter>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
  const isOwnListing = user && user.id === listing.userId;
  const isAvailable = listing.status === "available";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Back button */}
          <div className="mb-6">
            <Link href="/browse">
              <a className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back to Browse
              </a>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main content - 8 columns on large screens */}
            <div className="lg:col-span-8">
              {/* Image and badges */}
              <div className="relative rounded-lg overflow-hidden mb-6">
                <img 
                  src={listing.imageUrl || "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&h=500&q=80"} 
                  alt={listing.title} 
                  className="w-full object-cover h-[300px] md:h-[400px]"
                />
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <Badge variant="outline" className={`${listing.isFree ? "bg-green-500" : "bg-blue-500"} text-white border-0`}>
                    {listing.isFree ? "Free" : "Pay What You Can"}
                  </Badge>
                  <Badge variant="outline" className="bg-white text-primary border-0">
                    {listing.type}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge variant="outline" className={`${
                    listing.status === "available" 
                      ? "bg-green-500" 
                      : listing.status === "reserved" 
                      ? "bg-yellow-500" 
                      : "bg-gray-500"
                  } text-white border-0`}>
                    {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                  </Badge>
                </div>
              </div>
              
              {/* Title and description */}
              <div className="mb-8">
                <h1 className="text-3xl font-poppins font-bold mb-2">{listing.title}</h1>
                <div className="flex items-center text-muted-foreground mb-4">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm">Posted on {formatDate(listing.createdAt)}</span>
                </div>
                <p className="text-lg mb-4">{listing.description}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-2" />
                    <span>Quantity: {listing.quantity}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Available until: {formatDate(listing.expiryTime)}</span>
                  </div>
                </div>
              </div>
              
              {/* Tabs for Details and Location */}
              <Tabs defaultValue="details" className="mb-8">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="location">Location</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="p-4 bg-muted rounded-md">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Food Type</h3>
                      <p>{listing.type}</p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="font-medium mb-2">Quantity</h3>
                      <p>{listing.quantity}</p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="font-medium mb-2">Price</h3>
                      <p>
                        {listing.isFree 
                          ? "Free" 
                          : `Pay what you can (suggested: ₹${(listing.suggestedPrice || 0) / 100})`}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="font-medium mb-2">Expiry Time</h3>
                      <p>{formatDate(listing.expiryTime)}</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="location" className="p-4 bg-muted rounded-md">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-primary mr-2 mt-1" />
                      <div>
                        <h3 className="font-medium mb-1">Pickup Location</h3>
                        <p>{listing.location}</p>
                        <div className="mt-2 rounded-md overflow-hidden h-[200px] bg-neutral-200">
                          {/* Here you would normally embed a map with the coordinates */}
                          <div className="h-full w-full flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">
                              Map view will be shown here
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Info className="h-5 w-5 text-primary mr-2 mt-1" />
                      <div>
                        <h3 className="font-medium mb-1">Pickup Notes</h3>
                        <p>Contact the donor for specific pickup instructions.</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* About the concept of food sharing */}
              <Card className="mb-6 bg-accent/10 border-accent/20">
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <Heart className="h-6 w-6 text-primary mr-3 mt-1" />
                    <div>
                      <h3 className="font-poppins font-semibold text-lg mb-2">About Annadaan</h3>
                      <p className="text-muted-foreground">
                        Annadaan is the sacred act of donating food, considered one of the highest forms of charity in Indian culture. By participating, you're not just reducing food waste—you're honoring a centuries-old tradition that values generosity and community care.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Food safety guidelines */}
              <Card className="bg-muted">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Food Safety Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                    <li>Ensure the food is properly packed and sealed</li>
                    <li>Always check the expiry time before consuming</li>
                    <li>Heat the food thoroughly before consumption</li>
                    <li>If you notice anything unusual about the food, do not consume it</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar - 4 columns on large screens */}
            <div className="lg:col-span-4">
              {/* Action card */}
              <Card className="mb-6 sticky top-24">
                <CardHeader>
                  <CardTitle>Request This Food</CardTitle>
                  <CardDescription>
                    {isAvailable 
                      ? "This listing is currently available" 
                      : "This listing is no longer available"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isOwnListing ? (
                    <div className="text-center p-4 bg-muted rounded-md">
                      <p className="mb-2">This is your listing</p>
                      <Link href="/dashboard">
                        <a>
                          <Button variant="outline">
                            Go to Dashboard
                          </Button>
                        </a>
                      </Link>
                    </div>
                  ) : isAvailable ? (
                    <div>
                      {!listing.isFree && (
                        <div className="mb-4">
                          <p className="text-sm text-muted-foreground mb-2">
                            Suggested contribution: ₹{(listing.suggestedPrice || 0) / 100}
                          </p>
                          <div className="flex justify-between items-center">
                            <p className="text-sm">Pay what you can:</p>
                            <div className="flex items-center">
                              <span className="mr-2">₹</span>
                              <Input
                                type="number"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                className="w-24"
                                placeholder="Amount"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
                        <DialogTrigger asChild>
                          <Button className="w-full">
                            Request Food
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirm Food Request</DialogTitle>
                            <DialogDescription>
                              You're requesting "{listing.title}" from the donor. Please confirm the details below.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4 py-4">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Food Item:</span>
                              <span>{listing.title}</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Pickup Location:</span>
                              <span>{listing.location.split(",")[0]}</span>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Available Until:</span>
                              <span>{new Date(listing.expiryTime).toLocaleDateString()}</span>
                            </div>
                            
                            {!listing.isFree && (
                              <div className="flex justify-between items-center">
                                <span className="font-medium">Your Contribution:</span>
                                <span>₹{paymentAmount || 0}</span>
                              </div>
                            )}
                            
                            <div className="bg-muted p-3 rounded-md">
                              <p className="text-sm">
                                By requesting this food, you agree to pick it up at the specified location within the available time frame.
                              </p>
                            </div>
                          </div>
                          
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              onClick={() => setShowRequestDialog(false)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={handleRequestFood}
                              disabled={createTransactionMutation.isPending}
                            >
                              {createTransactionMutation.isPending ? "Sending Request..." : "Confirm Request"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-muted rounded-md">
                      <p className="mb-2">This listing is no longer available</p>
                      <Link href="/browse">
                        <a>
                          <Button variant="outline">
                            Browse Other Listings
                          </Button>
                        </a>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Donor info card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    About the Donor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-4">
                    <Avatar className="h-16 w-16 mr-4">
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                        {listing.title[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">Donor Name</h3>
                      <div className="flex items-center">
                        <BarChart className="h-3 w-3 mr-1 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          {user?.karmaPoints || 0} karma points
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    This donor has been a member of Annadaan Connect since {new Date().getFullYear()}.
                  </p>
                  
                  {/* Contact options - only visible if you're requesting the food */}
                  {isAvailable && !isOwnListing && (
                    <div className="space-y-2 border-t pt-4">
                      <p className="text-sm font-medium mb-2">Contact options available after request:</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>Phone number</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>Email</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ListingPage;
