import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { FoodListing, Transaction } from "@shared/schema";
import { Sidebar } from "@/components/ui/sidebar";
import Header from "@/components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Gift,
  ShoppingBag,
  Clock,
  Award,
  CheckCircle,
  XCircle,
  Plus,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import FoodListingCard from "@/components/FoodListingCard";
import { Separator } from "@/components/ui/separator";
import { useMobile } from "@/hooks/use-mobile";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(isMobile);

  // Fetch user's food listings
  const { data: userListings, isLoading: isListingsLoading } = useQuery<FoodListing[]>({
    queryKey: ["/api/user/listings"],
    enabled: !!user,
  });

  // Fetch user's transactions
  const { data: userTransactions, isLoading: isTransactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
    enabled: !!user,
  });

  // Handle transaction completion
  const handleCompleteTransaction = async (transactionId: number) => {
    try {
      await apiRequest("PATCH", `/api/transactions/${transactionId}/complete`, {
        reviewRating: 5, // Default rating
        reviewComment: "Thank you for the food!",
      });
      
      toast({
        title: "Transaction completed",
        description: "The transaction has been marked as completed.",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/listings"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle transaction cancellation
  const handleCancelTransaction = async (transactionId: number) => {
    try {
      await apiRequest("PATCH", `/api/transactions/${transactionId}/cancel`);
      
      toast({
        title: "Transaction cancelled",
        description: "The transaction has been cancelled.",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/listings"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter transactions based on user's role (donor or receiver)
  const donatedTransactions = userTransactions?.filter(
    (transaction) => transaction.donorId === user?.id
  ) || [];
  
  const receivedTransactions = userTransactions?.filter(
    (transaction) => transaction.receiverId === user?.id
  ) || [];

  // Count stats
  const totalDonated = donatedTransactions.length;
  const totalReceived = receivedTransactions.length;
  const activeDonations = userListings?.filter(
    (listing) => listing.status === "available"
  ).length || 0;
  const completedDonations = donatedTransactions.filter(
    (transaction) => transaction.status === "completed"
  ).length;

  // Format data for pie chart
  const statusData = [
    { name: "Active", value: activeDonations, color: "#60AD5E" },
    { name: "Completed", value: completedDonations, color: "#E65100" },
    { name: "Reserved", value: (userListings?.filter(
      (listing) => listing.status === "reserved"
    ).length || 0), color: "#FFB300" },
  ];

  // Format data for bar chart
  const activityData = [
    { name: "Donated", value: totalDonated },
    { name: "Received", value: totalReceived },
  ];

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
            <h1 className="text-2xl font-poppins font-bold">Dashboard</h1>
            <Link href="/create-listing">
              <a>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Share Food
                </Button>
              </a>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              title="Karma Points"
              value={user?.karmaPoints || 0}
              description="Your contribution score"
              icon={<Award className="h-5 w-5 text-primary" />}
              trend={"+5 this week"}
            />
            <StatsCard
              title="Active Donations"
              value={activeDonations}
              description="Currently available"
              icon={<Gift className="h-5 w-5 text-secondary" />}
            />
            <StatsCard
              title="Total Donated"
              value={totalDonated}
              description="Food items shared"
              icon={<ShoppingBag className="h-5 w-5 text-accent" />}
            />
            <StatsCard
              title="Total Received"
              value={totalReceived}
              description="Food items received"
              icon={<ShoppingBag className="h-5 w-5 text-primary" />}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Donations Status</CardTitle>
                <CardDescription>
                  Overview of your food listings status
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Donation Activity</CardTitle>
                <CardDescription>
                  Your donations and received items
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={activityData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="value"
                      fill="hsl(var(--primary))"
                      name="Count"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for Listings and Transactions */}
          <Tabs defaultValue="listings" className="space-y-4">
            <TabsList>
              <TabsTrigger value="listings">My Food Listings</TabsTrigger>
              <TabsTrigger value="donated">Donated</TabsTrigger>
              <TabsTrigger value="received">Received</TabsTrigger>
            </TabsList>

            {/* My Listings Tab */}
            <TabsContent value="listings" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-medium">My Food Listings</h2>
                <Link href="/create-listing">
                  <a>
                    <Button variant="outline" size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Listing
                    </Button>
                  </a>
                </Link>
              </div>

              {isListingsLoading ? (
                <div className="text-center py-8">Loading your listings...</div>
              ) : userListings && userListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userListings.map((listing) => (
                    <FoodListingCard
                      key={listing.id}
                      listing={listing}
                      showUserInfo={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted rounded-lg">
                  <Gift className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Food Listings Yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Share your excess food with your community by creating your
                    first listing.
                  </p>
                  <Link href="/create-listing">
                    <a>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Share Food Now
                      </Button>
                    </a>
                  </Link>
                </div>
              )}
            </TabsContent>

            {/* Donated Tab */}
            <TabsContent value="donated" className="space-y-4">
              <h2 className="text-xl font-medium">Food You've Donated</h2>

              {isTransactionsLoading ? (
                <div className="text-center py-8">Loading transactions...</div>
              ) : donatedTransactions.length > 0 ? (
                <div className="space-y-4">
                  {donatedTransactions.map((transaction) => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      type="donated"
                      onComplete={handleCompleteTransaction}
                      onCancel={handleCancelTransaction}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted rounded-lg">
                  <Gift className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Donations Yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't donated any food yet. Start sharing with your
                    community!
                  </p>
                  <Link href="/create-listing">
                    <a>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Share Food
                      </Button>
                    </a>
                  </Link>
                </div>
              )}
            </TabsContent>

            {/* Received Tab */}
            <TabsContent value="received" className="space-y-4">
              <h2 className="text-xl font-medium">Food You've Received</h2>

              {isTransactionsLoading ? (
                <div className="text-center py-8">Loading transactions...</div>
              ) : receivedTransactions.length > 0 ? (
                <div className="space-y-4">
                  {receivedTransactions.map((transaction) => (
                    <TransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      type="received"
                      onComplete={handleCompleteTransaction}
                      onCancel={handleCancelTransaction}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted rounded-lg">
                  <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No Received Food Yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't received any food yet. Browse available
                    donations!
                  </p>
                  <Link href="/browse">
                    <a>
                      <Button>
                        Find Food
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </Link>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  trend?: string;
}

const StatsCard = ({
  title,
  value,
  description,
  icon,
  trend,
}: StatsCardProps) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-bold">{value}</h3>
              {trend && (
                <span className="text-xs font-medium text-secondary">
                  {trend}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <div className="p-2 bg-primary/10 rounded-full">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

// Transaction Card Component
interface TransactionCardProps {
  transaction: Transaction;
  type: "donated" | "received";
  onComplete: (id: number) => void;
  onCancel: (id: number) => void;
}

const TransactionCard = ({
  transaction,
  type,
  onComplete,
  onCancel,
}: TransactionCardProps) => {
  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-md overflow-hidden w-16 h-16">
              <img
                src="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=250&q=80"
                alt="Food"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium">Transaction #{transaction.id}</h3>
                <Badge
                  variant={
                    transaction.status === "completed"
                      ? "default"
                      : transaction.status === "pending"
                      ? "outline"
                      : "destructive"
                  }
                  className="text-xs"
                >
                  {transaction.status.charAt(0).toUpperCase() +
                    transaction.status.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Listing ID: {transaction.listingId}
              </p>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-3 w-3 mr-1" />
                {transaction.createdAt
                  ? formatDate(transaction.createdAt)
                  : "Date unavailable"}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:items-end gap-2 w-full md:w-auto">
            {transaction.status === "pending" && (
              <div className="flex gap-2">
                {type === "received" && (
                  <Button
                    size="sm"
                    onClick={() => onComplete(transaction.id)}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCancel(transaction.id)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            )}
            {transaction.status === "completed" && transaction.reviewRating && (
              <div className="flex items-center">
                <span className="text-sm mr-2">Rating:</span>
                <div className="flex">
                  {[...Array(transaction.reviewRating)].map((_, i) => (
                    <svg
                      key={i}
                      className="h-4 w-4 text-accent fill-accent"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  ))}
                </div>
              </div>
            )}
            {transaction.status === "completed" && (
              <span className="text-xs text-muted-foreground">
                Completed on:{" "}
                {transaction.completedAt
                  ? formatDate(transaction.completedAt)
                  : "Date unavailable"}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
