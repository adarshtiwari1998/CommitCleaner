import { type User, type InsertUser, type Repository, type InsertRepository } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Repository operations
  createRepository(repository: InsertRepository): Promise<Repository>;
  getRepositories(): Promise<Repository[]>;
  getRepository(id: string): Promise<Repository | undefined>;
  getRepositoryByUrl(url: string): Promise<Repository | undefined>;
  updateRepository(id: string, updates: Partial<Repository>): Promise<Repository | undefined>;
  deleteRepository(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private repositories: Map<string, Repository>;

  constructor() {
    this.users = new Map();
    this.repositories = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createRepository(insertRepository: InsertRepository): Promise<Repository> {
    const id = randomUUID();
    const repository: Repository = { 
      ...insertRepository, 
      id,
      status: insertRepository.status || "pending",
      private: insertRepository.private || false,
      lastScanned: null,
      replitCommitsFound: null
    };
    this.repositories.set(id, repository);
    return repository;
  }

  async getRepositories(): Promise<Repository[]> {
    return Array.from(this.repositories.values());
  }

  async getRepository(id: string): Promise<Repository | undefined> {
    return this.repositories.get(id);
  }

  async getRepositoryByUrl(url: string): Promise<Repository | undefined> {
    return Array.from(this.repositories.values()).find(
      (repo) => repo.url === url
    );
  }

  async updateRepository(id: string, updates: Partial<Repository>): Promise<Repository | undefined> {
    const existing = this.repositories.get(id);
    if (!existing) {
      return undefined;
    }
    const updated: Repository = { ...existing, ...updates };
    this.repositories.set(id, updated);
    return updated;
  }

  async deleteRepository(id: string): Promise<boolean> {
    return this.repositories.delete(id);
  }
}

export const storage = new MemStorage();
