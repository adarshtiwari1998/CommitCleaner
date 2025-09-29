import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRepositorySchema } from "@shared/schema";
import { getRepositoryInfo, scanForReplitCommits } from "./github";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Repository routes
  
  // GET /api/repositories - Get all repositories
  app.get("/api/repositories", async (req, res) => {
    try {
      const repositories = await storage.getRepositories();
      res.json(repositories);
    } catch (error) {
      console.error("Failed to get repositories:", error);
      res.status(500).json({ error: "Failed to get repositories" });
    }
  });

  // GET /api/repositories/:id - Get a specific repository
  app.get("/api/repositories/:id", async (req, res) => {
    try {
      const repository = await storage.getRepository(req.params.id);
      if (!repository) {
        return res.status(404).json({ error: "Repository not found" });
      }
      res.json(repository);
    } catch (error) {
      console.error("Failed to get repository:", error);
      res.status(500).json({ error: "Failed to get repository" });
    }
  });

  // POST /api/repositories - Add a new repository
  app.post("/api/repositories", async (req, res) => {
    try {
      // Validate request body
      const urlSchema = z.object({
        url: z.string().url(),
      });
      
      const { url } = urlSchema.parse(req.body);
      
      // Check if repository already exists
      const existingRepo = await storage.getRepositoryByUrl(url);
      if (existingRepo) {
        return res.status(409).json({ error: "Repository already exists" });
      }
      
      // Get repository info from GitHub
      const repoInfo = await getRepositoryInfo(url);
      
      // Create repository record
      const newRepo = await storage.createRepository({
        url: repoInfo.url,
        name: repoInfo.name,
        owner: repoInfo.owner,
        private: repoInfo.private,
        status: "pending",
      });
      
      res.status(201).json(newRepo);
    } catch (error: any) {
      console.error("Failed to add repository:", error);
      if (error.message.includes("Invalid GitHub URL")) {
        return res.status(400).json({ error: "Invalid GitHub URL format" });
      }
      if (error.message.includes("Repository not found")) {
        return res.status(404).json({ error: "Repository not found or you do not have access to it" });
      }
      if (error.message.includes("GitHub not connected")) {
        return res.status(401).json({ error: "GitHub authentication required. Please connect your GitHub account." });
      }
      res.status(500).json({ error: error.message || "Failed to add repository" });
    }
  });

  // POST /api/repositories/:id/scan - Scan repository for Replit commits
  app.post("/api/repositories/:id/scan", async (req, res) => {
    try {
      const repository = await storage.getRepository(req.params.id);
      if (!repository) {
        return res.status(404).json({ error: "Repository not found" });
      }

      // Update status to scanning
      await storage.updateRepository(req.params.id, { 
        status: "scanning" 
      });

      try {
        // Scan for Replit commits
        const replitCommits = await scanForReplitCommits(repository.url);
        
        // Update repository with scan results
        const updatedRepo = await storage.updateRepository(req.params.id, {
          status: replitCommits.length > 0 ? "needs_cleanup" : "clean",
          lastScanned: new Date(),
          replitCommitsFound: replitCommits.length,
        });

        res.json({
          repository: updatedRepo,
          commits: replitCommits,
        });
      } catch (scanError: any) {
        // Update status to error if scan fails
        await storage.updateRepository(req.params.id, { 
          status: "error" 
        });
        throw scanError;
      }
    } catch (error: any) {
      console.error("Failed to scan repository:", error);
      if (error.message.includes("Repository not found")) {
        return res.status(404).json({ error: "Repository not found or you do not have access to it" });
      }
      if (error.message.includes("GitHub not connected")) {
        return res.status(401).json({ error: "GitHub authentication required. Please connect your GitHub account." });
      }
      res.status(500).json({ error: error.message || "Failed to scan repository" });
    }
  });

  // DELETE /api/repositories/:id - Delete a repository
  app.delete("/api/repositories/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteRepository(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Repository not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete repository:", error);
      res.status(500).json({ error: "Failed to delete repository" });
    }
  });

  // POST /api/repositories/:id/cleanup - Clean up Replit commits (placeholder)
  app.post("/api/repositories/:id/cleanup", async (req, res) => {
    try {
      const repository = await storage.getRepository(req.params.id);
      if (!repository) {
        return res.status(404).json({ error: "Repository not found" });
      }

      // For now, return an error indicating this feature is not yet implemented
      res.status(501).json({ 
        error: "Commit cleanup feature is not yet implemented for safety reasons. This would require git rebase operations that could damage repository history." 
      });
    } catch (error) {
      console.error("Failed to cleanup repository:", error);
      res.status(500).json({ error: "Failed to cleanup repository" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
