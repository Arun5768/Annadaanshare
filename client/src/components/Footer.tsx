import { Link } from "wouter";
import Logo from "./Logo";
import { Heart, Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-neutral-800 text-white py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Logo size="sm" className="text-white" />
            </div>
            <p className="text-neutral-300 mb-4">Building communities through the tradition of food sharing.</p>
            <div className="flex space-x-3">
              <a href="#" className="text-white hover:text-primary transition-colors" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-white hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-white hover:text-primary transition-colors" aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-white hover:text-primary transition-colors" aria-label="LinkedIn">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-poppins font-medium text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="text-neutral-300 hover:text-primary transition-colors">Home</a>
                </Link>
              </li>
              <li>
                <Link href="#about">
                  <a className="text-neutral-300 hover:text-primary transition-colors">About Us</a>
                </Link>
              </li>
              <li>
                <Link href="#how-it-works">
                  <a className="text-neutral-300 hover:text-primary transition-colors">How It Works</a>
                </Link>
              </li>
              <li>
                <Link href="/browse">
                  <a className="text-neutral-300 hover:text-primary transition-colors">Browse Food</a>
                </Link>
              </li>
              <li>
                <Link href="#stories">
                  <a className="text-neutral-300 hover:text-primary transition-colors">Community Stories</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-poppins font-medium text-lg mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#help">
                  <a className="text-neutral-300 hover:text-primary transition-colors">Help Center</a>
                </Link>
              </li>
              <li>
                <Link href="#guidelines">
                  <a className="text-neutral-300 hover:text-primary transition-colors">Food Safety Guidelines</a>
                </Link>
              </li>
              <li>
                <Link href="#tips">
                  <a className="text-neutral-300 hover:text-primary transition-colors">Donation Tips</a>
                </Link>
              </li>
              <li>
                <Link href="#partner">
                  <a className="text-neutral-300 hover:text-primary transition-colors">Partner With Us</a>
                </Link>
              </li>
              <li>
                <Link href="#blog">
                  <a className="text-neutral-300 hover:text-primary transition-colors">Blog</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-poppins font-medium text-lg mb-4">Contact Us</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Mail className="text-primary mr-2 mt-1 h-4 w-4" />
                <span className="text-neutral-300">contact@annadaanconnect.org</span>
              </li>
              <li className="flex items-start">
                <Phone className="text-primary mr-2 mt-1 h-4 w-4" />
                <span className="text-neutral-300">+91 123 456 7890</span>
              </li>
              <li className="flex items-start">
                <MapPin className="text-primary mr-2 mt-1 h-4 w-4" />
                <span className="text-neutral-300">123 Community Way, Bangalore, Karnataka, India</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-neutral-400 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Annadaan Connect. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link href="/privacy">
              <a className="text-neutral-400 hover:text-primary transition-colors">Privacy Policy</a>
            </Link>
            <Link href="/terms">
              <a className="text-neutral-400 hover:text-primary transition-colors">Terms of Service</a>
            </Link>
            <Link href="/accessibility">
              <a className="text-neutral-400 hover:text-primary transition-colors">Accessibility</a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
