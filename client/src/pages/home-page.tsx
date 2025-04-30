import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { 
  PlusCircle, 
  Search, 
  MapPin, 
  Heart, 
  Apple, 
  Play,
  Star,
  Clock,
  Award
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { FoodListing } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect } from "react";
import gsap from "gsap";

const HomePage = () => {
  const { user } = useAuth();
  const [animationTriggered, setAnimationTriggered] = useState(false);

  // Get available food listings
  const { data: listings } = useQuery<FoodListing[]>({
    queryKey: ['/api/listings'],
    enabled: true,
  });

  useEffect(() => {
    if (!animationTriggered) {
      try {
        // Hero section animations
        gsap.from('.hero-content h2, .hero-content p, .hero-content .buttons', {
          opacity: 0,
          y: 20,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power1.out'
        });

        // Stats animation (simplified version without ScrollTrigger)
        gsap.from('.stat-item', {
          opacity: 0,
          y: 20,
          duration: 0.8,
          stagger: 0.1,
          delay: 0.5
        });
      } catch (error) {
        console.error("Animation error:", error);
      }

      setAnimationTriggered(true);
    }
  }, [animationTriggered]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary to-primary-dark text-white py-16 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-5 left-5 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 border-2 border-white rounded-full"></div>
          <div className="absolute top-20 right-20 w-20 h-20 border-2 border-white rounded-full"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0 hero-content">
              <h2 className="font-poppins font-bold text-3xl md:text-4xl lg:text-5xl mb-4">Share Food, Share Love</h2>
              <p className="text-lg md:text-xl mb-6 text-neutral-100">Connect with your community through the ancient tradition of Annadaan. Share your excess food with those in need or find nourishment when you need it most.</p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 buttons">
                <Link href={user ? "/create-listing" : "/auth"}>
                  <a>
                    <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Share Food
                    </Button>
                  </a>
                </Link>
                <Link href="/browse">
                  <a>
                    <Button size="lg" variant="outline" className="bg-white text-primary hover:bg-neutral-100 w-full sm:w-auto">
                      <Search className="mr-2 h-4 w-4" />
                      Find Food
                    </Button>
                  </a>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center md:justify-end">
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80" 
                alt="People sharing food in community" 
                className="rounded-lg shadow-lg max-w-full h-auto" 
                style={{ maxHeight: "400px" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white" id="how-it-works">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-poppins font-bold text-3xl text-neutral-800 mb-3">How Annadaan Connect Works</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">Join our community of food sharers and receivers to reduce waste and spread joy through the sacred act of Annadaan.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-neutral-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mb-4 mx-auto">
                <PlusCircle className="text-white h-8 w-8" />
              </div>
              <h3 className="font-poppins font-semibold text-xl text-center mb-3">List Your Excess Food</h3>
              <p className="text-neutral-600 text-center">Take a photo, add details about your food offering, and set your preferences for pickup or delivery.</p>
            </div>
            
            <div className="bg-neutral-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-secondary-light rounded-full flex items-center justify-center mb-4 mx-auto">
                <MapPin className="text-white h-8 w-8" />
              </div>
              <h3 className="font-poppins font-semibold text-xl text-center mb-3">Connect Locally</h3>
              <p className="text-neutral-600 text-center">Our system matches your food offering with nearby community members who can benefit from your generosity.</p>
            </div>
            
            <div className="bg-neutral-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4 mx-auto">
                <Heart className="text-white h-8 w-8" />
              </div>
              <h3 className="font-poppins font-semibold text-xl text-center mb-3">Share With Dignity</h3>
              <p className="text-neutral-600 text-center">Arrange pickup or delivery in a way that respects everyone's dignity and builds community bonds.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 bg-neutral-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-poppins font-bold text-3xl text-neutral-800 mb-2">Available Food Nearby</h2>
              <p className="text-neutral-600">Recent food offerings in your community</p>
            </div>
            <Link href="/browse">
              <a className="text-primary hover:text-primary-dark font-medium flex items-center">
                View All
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings && listings.length > 0 ? (
              listings.slice(0, 3).map((listing) => (
                <FoodListingCard key={listing.id} listing={listing} />
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-neutral-600">No food listings available at the moment.</p>
                <Link href={user ? "/create-listing" : "/auth"}>
                  <a>
                    <Button className="mt-4">
                      {user ? "Share Food Now" : "Sign Up to Share Food"}
                    </Button>
                  </a>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Cultural Section */}
      <section className="py-16 bg-gradient-to-r from-accent-light to-accent" id="about">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-kalam font-bold text-3xl text-primary-dark mb-3">The Spirit of Annadaan</h2>
            <p className="text-neutral-700 max-w-2xl mx-auto">Annadaan, the act of donating food, has been a sacred tradition in Indian culture for centuries.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80" 
                alt="Community food sharing" 
                className="rounded-lg shadow-lg w-full"
              />
            </div>
            <div>
              <div className="bg-white bg-opacity-90 rounded-lg p-6 shadow-md">
                <h3 className="font-poppins font-semibold text-xl mb-4 text-primary-dark">A Culture of Generosity</h3>
                <p className="text-neutral-700 mb-4">"अन्नदानम् परम् दानम्" (Annadanam Param Danam) - Giving food is the greatest gift. In our culture, sharing food is considered one of the highest forms of generosity and service.</p>
                <p className="text-neutral-700 mb-4">Annadaan Connect brings this ancient practice into the modern world, helping reduce food waste while honoring the dignity of both givers and receivers.</p>
                <div className="flex items-center">
                  <div className="h-px flex-1 bg-neutral-300"></div>
                  <div className="px-3">
                    <svg className="w-10 h-10" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M25 5C25 5 10 15 10 30C10 38.2843 16.7157 45 25 45C33.2843 45 40 38.2843 40 30C40 15 25 5 25 5Z" fill="hsl(var(--secondary))" stroke="hsl(var(--primary))" strokeWidth="2"/>
                      <path d="M25 15C25 15 18 20 18 27.5C18 31.6421 21.134 35 25 35C28.866 35 32 31.6421 32 27.5C32 20 25 15 25 15Z" fill="hsl(var(--accent))"/>
                    </svg>
                  </div>
                  <div className="h-px flex-1 bg-neutral-300"></div>
                </div>
                <p className="text-neutral-700 mt-4 italic font-kalam text-lg text-center">"When you share food, you share more than sustenance – you share your heart."</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <StatItem value="15,000+" label="Meals Shared" />
            <StatItem value="2,500+" label="Active Users" />
            <StatItem value="120+" label="Communities Served" />
            <StatItem value="5,000+" label="Kg Food Saved" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="font-poppins font-bold text-3xl mb-4">Ready to Join the Movement?</h2>
            <p className="text-lg mb-8">Become part of our growing community of food sharers and help reduce waste while spreading joy.</p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link href={user ? "/create-listing" : "/auth"}>
                <a>
                  <Button size="lg" variant="outline" className="bg-white text-secondary hover:bg-neutral-100 w-full sm:w-auto">
                    {user ? "Share Food Now" : "Sign Up Now"}
                  </Button>
                </a>
              </Link>
              <Link href="#how-it-works">
                <a>
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-secondary w-full sm:w-auto">
                    Learn More
                  </Button>
                </a>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-neutral-100" id="stories">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-poppins font-bold text-3xl text-neutral-800 mb-3">Community Voices</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">Hear from our community of food sharers and receivers</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              name="Rajesh Kumar"
              role="Food Donor"
              image="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80"
              quote="My restaurant often had leftover food at the end of the day that was perfectly good. Instead of throwing it away, I now share it with students and others in need. It feels great to reduce waste and help others."
              rating={5}
            />
            
            <TestimonialCard 
              name="Anita Sharma"
              role="Food Receiver"
              image="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80"
              quote="As a single mother working two jobs, sometimes cooking is impossible. Annadaan Connect has been a blessing, allowing me to provide healthy meals for my children even on the busiest days."
              rating={4.5}
            />
            
            <TestimonialCard 
              name="Vikram Singh"
              role="Community Organizer"
              image="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80"
              quote="We've integrated Annadaan Connect into our community center. It's strengthened bonds between neighbors and reduced food insecurity while honoring the dignity of everyone involved."
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* App Download Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h2 className="font-poppins font-bold text-3xl text-neutral-800 mb-4">Get the Annadaan Connect App</h2>
              <p className="text-neutral-600 mb-6">Make food sharing even easier with our mobile app. Get notifications, manage your donations, and find food on the go.</p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <Button variant="outline" className="flex items-center justify-center bg-neutral-800 text-white hover:bg-neutral-700">
                  <Apple className="h-5 w-5 mr-2" />
                  <div>
                    <div className="text-xs">Download on the</div>
                    <div className="font-medium">App Store</div>
                  </div>
                </Button>
                <Button variant="outline" className="flex items-center justify-center bg-neutral-800 text-white hover:bg-neutral-700">
                  <Play className="h-5 w-5 mr-2" />
                  <div>
                    <div className="text-xs">GET IT ON</div>
                    <div className="font-medium">Google Play</div>
                  </div>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center md:justify-end">
              <img 
                src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80" 
                alt="Annadaan Connect App on Smartphone" 
                className="rounded-lg shadow-lg max-w-full h-auto" 
                style={{ maxHeight: "400px" }}
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Food Listing Card Component
interface FoodListingCardProps {
  listing: FoodListing;
}

const FoodListingCard: React.FC<FoodListingCardProps> = ({ listing }) => {
  // Format relative time
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.round((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours === 1) return '1 hr ago';
    if (diffInHours < 24) return `${diffInHours} hrs ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    return `${diffInDays} days ago`;
  };
  
  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative">
        <img 
          src={listing.imageUrl || "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=250&q=80"} 
          alt={listing.title} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded">
          {listing.isFree ? 'Free' : 'Pay What You Can'}
        </div>
        <div className="absolute top-3 right-3 bg-white text-primary text-xs font-medium px-2 py-1 rounded flex items-center">
          <MapPin className="mr-1 h-3 w-3" /> 2.1 km
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-poppins font-medium text-lg">{listing.title}</h3>
          <span className="text-neutral-500 text-sm">{getRelativeTime(listing.createdAt || new Date())}</span>
        </div>
        <p className="text-neutral-600 text-sm mb-3 line-clamp-2">{listing.description}</p>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white mr-2">
              {listing.title[0].toUpperCase()}
            </div>
            <span className="text-sm text-neutral-700">User</span>
          </div>
          <Link href={`/listing/${listing.id}`}>
            <a>
              <Button size="sm" variant="default">View</Button>
            </a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

// Testimonial Card Component
interface TestimonialCardProps {
  name: string;
  role: string;
  image: string;
  quote: string;
  rating: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ name, role, image, quote, rating }) => {
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="fill-accent text-accent h-4 w-4" />);
    }
    
    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none">
          <path d="M12 4V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 4L19 19L12 15.5L5 19L12 4Z" fill="hsl(var(--accent))" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    }
    
    const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-accent h-4 w-4" />);
    }
    
    return stars;
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center mb-4">
        <img src={image} alt={name} className="w-12 h-12 rounded-full mr-3 object-cover" />
        <div>
          <h4 className="font-poppins font-medium text-neutral-800">{name}</h4>
          <div className={`text-sm ${role === 'Food Donor' ? 'text-primary' : role === 'Food Receiver' ? 'text-secondary' : 'text-neutral-700'}`}>
            {role}
          </div>
        </div>
      </div>
      <p className="text-neutral-600 italic mb-4">{quote}</p>
      <div className="flex text-accent">
        {renderStars()}
      </div>
    </div>
  );
};

// Stat Item Component
interface StatItemProps {
  value: string;
  label: string;
}

const StatItem: React.FC<StatItemProps> = ({ value, label }) => {
  return (
    <div className="p-6 stat-item">
      <div className="text-primary font-poppins font-bold text-4xl mb-2">{value}</div>
      <div className="text-neutral-700">{label}</div>
    </div>
  );
};

export default HomePage;
