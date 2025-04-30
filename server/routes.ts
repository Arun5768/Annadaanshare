import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { insertFoodListingSchema, insertTransactionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Food Listings routes
  app.get("/api/listings", async (req, res, next) => {
    try {
      const { status, type, location } = req.query;
      
      const filters: any = {};
      if (status) filters.status = status;
      if (type) filters.type = type;
      
      // Get all listings with filters
      const listings = await storage.getFoodListings(filters);
      
      // Filter by location if provided (simple string matching for now)
      let filteredListings = listings;
      if (location) {
        filteredListings = listings.filter(listing => 
          listing.location.toLowerCase().includes(location.toString().toLowerCase())
        );
      }
      
      res.json(filteredListings);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/listings/:id", async (req, res, next) => {
    try {
      const listing = await storage.getFoodListing(parseInt(req.params.id));
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      res.json(listing);
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/listings", isAuthenticated, async (req, res, next) => {
    try {
      const listingData = {
        ...req.body,
        userId: req.user.id
      };
      
      const validatedData = insertFoodListingSchema.parse(listingData);
      const listing = await storage.createFoodListing(validatedData);
      res.status(201).json(listing);
    } catch (err) {
      if (err instanceof ZodError) {
        const validationError = fromZodError(err);
        return res.status(400).json({ message: validationError.message });
      }
      next(err);
    }
  });

  app.patch("/api/listings/:id/status", isAuthenticated, async (req, res, next) => {
    try {
      const { status } = req.body;
      const listingId = parseInt(req.params.id);
      
      const listing = await storage.getFoodListing(listingId);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      // Only the owner can update the listing status
      if (listing.userId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.updateFoodListingStatus(listingId, status);
      res.json({ message: "Listing status updated" });
    } catch (err) {
      next(err);
    }
  });

  // User listings
  app.get("/api/user/listings", isAuthenticated, async (req, res, next) => {
    try {
      const listings = await storage.getUserFoodListings(req.user.id);
      res.json(listings);
    } catch (err) {
      next(err);
    }
  });

  // Transaction routes
  app.post("/api/transactions", isAuthenticated, async (req, res, next) => {
    try {
      const transactionData = {
        ...req.body,
        receiverId: req.user.id
      };
      
      // Validate data
      const validatedData = insertTransactionSchema.parse(transactionData);
      
      // Check if listing exists and is available
      const listing = await storage.getFoodListing(validatedData.listingId);
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      
      if (listing.status !== "available") {
        return res.status(400).json({ message: "This food listing is no longer available" });
      }
      
      // Create transaction
      const transaction = await storage.createTransaction(validatedData);
      
      // Update listing status to reserved
      await storage.updateFoodListingStatus(validatedData.listingId, "reserved");
      
      res.status(201).json(transaction);
    } catch (err) {
      if (err instanceof ZodError) {
        const validationError = fromZodError(err);
        return res.status(400).json({ message: validationError.message });
      }
      next(err);
    }
  });

  app.get("/api/transactions", isAuthenticated, async (req, res, next) => {
    try {
      const transactions = await storage.getUserTransactions(req.user.id);
      res.json(transactions);
    } catch (err) {
      next(err);
    }
  });

  app.get("/api/transactions/:id", isAuthenticated, async (req, res, next) => {
    try {
      const transaction = await storage.getTransaction(parseInt(req.params.id));
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      // Only donor or receiver can see the transaction
      if (transaction.donorId !== req.user.id && transaction.receiverId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(transaction);
    } catch (err) {
      next(err);
    }
  });

  app.patch("/api/transactions/:id/complete", isAuthenticated, async (req, res, next) => {
    try {
      const { reviewRating, reviewComment } = req.body;
      const transactionId = parseInt(req.params.id);
      
      const transaction = await storage.getTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      // Only the receiver can complete the transaction
      if (transaction.receiverId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      if (transaction.status !== "pending") {
        return res.status(400).json({ message: "This transaction cannot be completed" });
      }
      
      await storage.completeTransaction(transactionId, reviewRating, reviewComment);
      res.json({ message: "Transaction completed" });
    } catch (err) {
      next(err);
    }
  });

  app.patch("/api/transactions/:id/cancel", isAuthenticated, async (req, res, next) => {
    try {
      const transactionId = parseInt(req.params.id);
      
      const transaction = await storage.getTransaction(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      // Only donor or receiver can cancel
      if (transaction.donorId !== req.user.id && transaction.receiverId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      if (transaction.status !== "pending") {
        return res.status(400).json({ message: "This transaction cannot be cancelled" });
      }
      
      await storage.updateTransactionStatus(transactionId, "cancelled");
      
      // Make the listing available again
      await storage.updateFoodListingStatus(transaction.listingId, "available");
      
      res.json({ message: "Transaction cancelled" });
    } catch (err) {
      next(err);
    }
  });

  // User profile
  app.patch("/api/user/profile", isAuthenticated, async (req, res, next) => {
    try {
      const allowedFields = ["name", "email", "phone", "address", "city", "bio", "avatar"];
      
      const updateData: any = {};
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }
      
      const updatedUser = await storage.updateUserProfile(req.user.id, updateData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (err) {
      next(err);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
