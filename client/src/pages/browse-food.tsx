import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FoodListing } from "@shared/schema";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FoodListingCard from "@/components/FoodListingCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Search, SlidersHorizontal, X, MapPin } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useMobile } from "@/hooks/use-mobile";

const BrowseFood = () => {
  const isMobile = useMobile();
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [foodType, setFoodType] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [distanceRange, setDistanceRange] = useState<number[]>([10]);
  const [showFilters, setShowFilters] = useState(!isMobile);
  const [filtersApplied, setFiltersApplied] = useState(false);
  
  // Fetch all food listings
  const { data: foodListings, isLoading } = useQuery<FoodListing[]>({
    queryKey: ["/api/listings"],
  });
  
  // Filter listings based on selected filters
  const filteredListings = React.useMemo(() => {
    if (!foodListings) return [];
    
    return foodListings.filter(listing => {
      // Filter by search term
      const matchesSearch = 
        searchTerm === "" || 
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by food type
      const matchesType = 
        foodType === "all" || 
        listing.type.toLowerCase() === foodType.toLowerCase();
      
      // Filter by price
      const matchesPrice = 
        priceFilter === "all" || 
        (priceFilter === "free" && listing.isFree) ||
        (priceFilter === "pay-what-you-can" && !listing.isFree);
      
      // Filter by location (simple string matching for now)
      const matchesLocation = 
        locationFilter === "" ||
        listing.location.toLowerCase().includes(locationFilter.toLowerCase());
      
      // For distance filtering, we'd normally use coordinates, but for simplicity:
      // We'll assume all listings are within distance range if distance is at max (10km)
      const matchesDistance = distanceRange[0] === 10 || true;
      
      return matchesSearch && matchesType && matchesPrice && matchesLocation && matchesDistance;
    });
  }, [foodListings, searchTerm, foodType, priceFilter, locationFilter, distanceRange]);
  
  // Function to handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFiltersApplied(true);
  };
  
  // Function to reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setFoodType("all");
    setPriceFilter("all");
    setLocationFilter("");
    setDistanceRange([10]);
    setFiltersApplied(false);
  };
  
  // Function to handle filter changes
  const applyFilters = () => {
    setFiltersApplied(true);
    if (isMobile) {
      setShowFilters(false);
    }
  };

  // Filter options
  const foodTypes = ["all", "veg", "non-veg", "vegan"];
  const priceOptions = ["all", "free", "pay-what-you-can"];
  const cityOptions = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad"];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Hero section */}
          <div className="mb-8">
            <h1 className="text-3xl font-poppins font-bold mb-2">Browse Available Food</h1>
            <p className="text-muted-foreground">
              Find food donations near you and connect with your community.
            </p>
          </div>
          
          {/* Search bar - always visible */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for food..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit">Search</Button>
              {isMobile && (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="px-3">
                      <SlidersHorizontal className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="py-4">
                      <MobileFilters
                        foodType={foodType}
                        setFoodType={setFoodType}
                        priceFilter={priceFilter}
                        setPriceFilter={setPriceFilter}
                        locationFilter={locationFilter}
                        setLocationFilter={setLocationFilter}
                        distanceRange={distanceRange}
                        setDistanceRange={setDistanceRange}
                        foodTypes={foodTypes}
                        priceOptions={priceOptions}
                        cityOptions={cityOptions}
                      />
                    </div>
                    <SheetFooter>
                      <div className="flex justify-between w-full">
                        <Button variant="outline" onClick={resetFilters}>Reset</Button>
                        <Button onClick={applyFilters}>Apply Filters</Button>
                      </div>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </form>
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Filters sidebar for desktop */}
            {!isMobile && (
              <aside className="w-full md:w-80 shrink-0">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium">Filters</h2>
                      {filtersApplied && (
                        <Button variant="ghost" size="sm" onClick={resetFilters}>
                          <X className="h-4 w-4 mr-1" />
                          Reset
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-6">
                      {/* Food Type Filter */}
                      <div>
                        <Label className="mb-2 block">Food Type</Label>
                        <Select value={foodType} onValueChange={setFoodType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select food type" />
                          </SelectTrigger>
                          <SelectContent>
                            {foodTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Price Filter */}
                      <div>
                        <Label className="mb-2 block">Price</Label>
                        <Select value={priceFilter} onValueChange={setPriceFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select price option" />
                          </SelectTrigger>
                          <SelectContent>
                            {priceOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option === "all" 
                                  ? "All" 
                                  : option === "free" 
                                  ? "Free" 
                                  : "Pay What You Can"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Location Filter */}
                      <div>
                        <Label className="mb-2 block">Location</Label>
                        <Select 
                          value={locationFilter} 
                          onValueChange={setLocationFilter}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select city" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Any Location</SelectItem>
                            {cityOptions.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Distance Filter */}
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Distance</Label>
                          <span className="text-sm text-muted-foreground">
                            {distanceRange[0]} km
                          </span>
                        </div>
                        <Slider
                          value={distanceRange}
                          min={1}
                          max={10}
                          step={1}
                          onValueChange={setDistanceRange}
                        />
                      </div>
                      
                      <Button className="w-full" onClick={applyFilters}>
                        Apply Filters
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </aside>
            )}
            
            {/* Main content */}
            <div className="flex-1">
              {/* Applied filters */}
              {filtersApplied && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {searchTerm && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Search: {searchTerm}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
                    </Badge>
                  )}
                  {foodType !== "all" && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Type: {foodType.charAt(0).toUpperCase() + foodType.slice(1)}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setFoodType("all")} />
                    </Badge>
                  )}
                  {priceFilter !== "all" && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Price: {priceFilter === "free" ? "Free" : "Pay What You Can"}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setPriceFilter("all")} />
                    </Badge>
                  )}
                  {locationFilter && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Location: {locationFilter}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setLocationFilter("")} />
                    </Badge>
                  )}
                  {distanceRange[0] < 10 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Distance: ≤ {distanceRange[0]} km
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setDistanceRange([10])} />
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Results count */}
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">
                  {isLoading 
                    ? "Loading listings..." 
                    : `Showing ${filteredListings.length} ${filteredListings.length === 1 ? 'listing' : 'listings'}`
                  }
                </p>
              </div>
              
              {/* Listings grid */}
              {isLoading ? (
                <div className="text-center py-20">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Loading food listings...</p>
                </div>
              ) : filteredListings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredListings.map((listing) => (
                    <FoodListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-muted rounded-lg">
                  <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Listings Found</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-4">
                    We couldn't find any food listings matching your criteria. Try adjusting your filters or search for something else.
                  </p>
                  <Button variant="outline" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

// Mobile filters component
interface MobileFiltersProps {
  foodType: string;
  setFoodType: (value: string) => void;
  priceFilter: string;
  setPriceFilter: (value: string) => void;
  locationFilter: string;
  setLocationFilter: (value: string) => void;
  distanceRange: number[];
  setDistanceRange: (value: number[]) => void;
  foodTypes: string[];
  priceOptions: string[];
  cityOptions: string[];
}

const MobileFilters: React.FC<MobileFiltersProps> = ({
  foodType,
  setFoodType,
  priceFilter,
  setPriceFilter,
  locationFilter,
  setLocationFilter,
  distanceRange,
  setDistanceRange,
  foodTypes,
  priceOptions,
  cityOptions,
}) => {
  return (
    <div className="space-y-5">
      {/* Food Type Filter */}
      <div>
        <Label className="mb-2 block">Food Type</Label>
        <Select value={foodType} onValueChange={setFoodType}>
          <SelectTrigger>
            <SelectValue placeholder="Select food type" />
          </SelectTrigger>
          <SelectContent>
            {foodTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Separator />
      
      {/* Price Filter */}
      <div>
        <Label className="mb-2 block">Price</Label>
        <Select value={priceFilter} onValueChange={setPriceFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Select price option" />
          </SelectTrigger>
          <SelectContent>
            {priceOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option === "all" 
                  ? "All" 
                  : option === "free" 
                  ? "Free" 
                  : "Pay What You Can"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Separator />
      
      {/* Location Filter */}
      <div>
        <Label className="mb-2 block">Location</Label>
        <Select 
          value={locationFilter} 
          onValueChange={setLocationFilter}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select city" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any Location</SelectItem>
            {cityOptions.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Separator />
      
      {/* Distance Filter */}
      <div>
        <div className="flex justify-between mb-2">
          <Label>Distance</Label>
          <span className="text-sm text-muted-foreground">
            {distanceRange[0]} km
          </span>
        </div>
        <Slider
          value={distanceRange}
          min={1}
          max={10}
          step={1}
          onValueChange={setDistanceRange}
        />
      </div>
    </div>
  );
};

export default BrowseFood;
