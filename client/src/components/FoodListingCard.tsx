import React from "react";
import { FoodListing } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface FoodListingCardProps {
  listing: FoodListing;
  showUserInfo?: boolean;
  showFullDescription?: boolean;
  showActions?: boolean;
}

const FoodListingCard: React.FC<FoodListingCardProps> = ({
  listing,
  showUserInfo = true,
  showFullDescription = false,
  showActions = true,
}) => {
  // Format relative time
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.round(
      (now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours === 1) return "1 hr ago";
    if (diffInHours < 24) return `${diffInHours} hrs ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Yesterday";
    return `${diffInDays} days ago`;
  };

  // Format expiry time
  const getExpiryTime = (date: Date) => {
    const expiryDate = new Date(date);
    return expiryDate.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Get price display
  const getPriceDisplay = () => {
    if (listing.isFree) {
      return (
        <Badge variant="outline" className="bg-green-500 text-white border-0">
          Free
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-blue-500 text-white border-0">
          Pay What You Can
        </Badge>
      );
    }
  };

  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
      <div className="relative">
        <img
          src={
            listing.imageUrl ||
            "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=250&q=80"
          }
          alt={listing.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3">{getPriceDisplay()}</div>
        <div className="absolute top-3 right-3 bg-white text-primary text-xs font-medium px-2 py-1 rounded flex items-center">
          <MapPin className="mr-1 h-3 w-3" /> {listing.location.split(",")[0]}
        </div>
      </div>
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-poppins font-medium text-lg">{listing.title}</h3>
          <span className="text-neutral-500 text-sm">
            {getRelativeTime(listing.createdAt)}
          </span>
        </div>
        <p
          className={`text-neutral-600 text-sm mb-3 ${
            showFullDescription ? "" : "line-clamp-2"
          }`}
        >
          {listing.description}
        </p>
        
        <div className="text-sm text-neutral-500 flex items-center mt-auto mb-3">
          <Clock className="h-3 w-3 mr-1" />
          <span>Available until {getExpiryTime(listing.expiryTime)}</span>
        </div>
        
        <div className="mt-2 mb-2">
          <Badge variant="outline" className="mr-2">
            {listing.type}
          </Badge>
          <Badge variant="outline">{listing.quantity}</Badge>
        </div>
        
        <div className="flex justify-between items-center mt-auto">
          {showUserInfo && (
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {listing.title[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-neutral-700">User</span>
            </div>
          )}
          
          {showActions && (
            <Link href={`/listing/${listing.id}`}>
              <a>
                <Button size="sm" variant="default">
                  View Details
                </Button>
              </a>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FoodListingCard;
