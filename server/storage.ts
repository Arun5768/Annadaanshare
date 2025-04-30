import { FoodListing, InsertFoodListing, InsertTransaction, InsertUser, Transaction, User, foodListings, transactions, users } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User-related operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserKarma(userId: number, karmaPoints: number): Promise<void>;
  updateUserProfile(userId: number, profileData: Partial<User>): Promise<User>;

  // Food listing operations
  createFoodListing(listing: InsertFoodListing): Promise<FoodListing>;
  getFoodListing(id: number): Promise<FoodListing | undefined>;
  getFoodListings(filters?: Partial<FoodListing>): Promise<FoodListing[]>;
  getUserFoodListings(userId: number): Promise<FoodListing[]>;
  updateFoodListingStatus(id: number, status: string): Promise<void>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  updateTransactionStatus(id: number, status: string): Promise<void>;
  completeTransaction(id: number, reviewRating?: number, reviewComment?: string): Promise<void>;

  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private usersStore: Map<number, User>;
  private foodListingsStore: Map<number, FoodListing>;
  private transactionsStore: Map<number, Transaction>;
  private userId: number;
  private listingId: number;
  private transactionId: number;
  
  sessionStore: session.Store;

  constructor() {
    this.usersStore = new Map();
    this.foodListingsStore = new Map();
    this.transactionsStore = new Map();
    this.userId = 1;
    this.listingId = 1;
    this.transactionId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24h in ms
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.usersStore.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersStore.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { 
      ...user, 
      id, 
      karmaPoints: 0,
      createdAt: new Date()
    };
    this.usersStore.set(id, newUser);
    return newUser;
  }

  async updateUserKarma(userId: number, karmaPoints: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { 
      ...user, 
      karmaPoints: user.karmaPoints + karmaPoints 
    };
    this.usersStore.set(userId, updatedUser);
  }

  async updateUserProfile(userId: number, profileData: Partial<User>): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    
    const updatedUser = { ...user, ...profileData };
    this.usersStore.set(userId, updatedUser);
    return updatedUser;
  }

  // Food listing operations
  async createFoodListing(listing: InsertFoodListing): Promise<FoodListing> {
    const id = this.listingId++;
    const newListing: FoodListing = {
      ...listing,
      id,
      status: "available",
      createdAt: new Date()
    };
    this.foodListingsStore.set(id, newListing);
    return newListing;
  }

  async getFoodListing(id: number): Promise<FoodListing | undefined> {
    return this.foodListingsStore.get(id);
  }

  async getFoodListings(filters?: Partial<FoodListing>): Promise<FoodListing[]> {
    let listings = Array.from(this.foodListingsStore.values());
    
    if (filters) {
      listings = listings.filter(listing => {
        for (const [key, value] of Object.entries(filters)) {
          if (listing[key as keyof FoodListing] !== value) {
            return false;
          }
        }
        return true;
      });
    }
    
    // Sort by newest first
    return listings.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getUserFoodListings(userId: number): Promise<FoodListing[]> {
    return this.getFoodListings({ userId });
  }

  async updateFoodListingStatus(id: number, status: string): Promise<void> {
    const listing = await this.getFoodListing(id);
    if (!listing) throw new Error("Food listing not found");
    
    const updatedListing = { ...listing, status };
    this.foodListingsStore.set(id, updatedListing);
  }

  // Transaction operations
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionId++;
    const newTransaction: Transaction = {
      ...transaction,
      id,
      status: "pending",
      createdAt: new Date(),
      completedAt: undefined
    };
    this.transactionsStore.set(id, newTransaction);
    return newTransaction;
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactionsStore.get(id);
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactionsStore.values())
      .filter(transaction => transaction.donorId === userId || transaction.receiverId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateTransactionStatus(id: number, status: string): Promise<void> {
    const transaction = await this.getTransaction(id);
    if (!transaction) throw new Error("Transaction not found");
    
    const updatedTransaction = { 
      ...transaction, 
      status,
      completedAt: status === "completed" ? new Date() : transaction.completedAt
    };
    this.transactionsStore.set(id, updatedTransaction);
  }

  async completeTransaction(id: number, reviewRating?: number, reviewComment?: string): Promise<void> {
    const transaction = await this.getTransaction(id);
    if (!transaction) throw new Error("Transaction not found");
    
    const updatedTransaction = { 
      ...transaction, 
      status: "completed",
      completedAt: new Date(),
      reviewRating,
      reviewComment
    };
    this.transactionsStore.set(id, updatedTransaction);
    
    // Update food listing status to completed
    await this.updateFoodListingStatus(transaction.listingId, "completed");
    
    // Award karma points to donor (5 points per completed donation)
    await this.updateUserKarma(transaction.donorId, 5);
  }
}

export const storage = new MemStorage();
