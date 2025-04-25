import { db } from "./index";
import * as schema from "@shared/schema";

async function seed() {
  try {
    // Create a default user for demonstration
    const [defaultUser] = await db.insert(schema.users)
      .values({
        username: "demo_user",
        password: "hashed_password_would_go_here", // In production, use proper password hashing
      })
      .returning()
      .onConflictDoNothing();
    
    if (defaultUser) {
      console.log("Created default user:", defaultUser.username);
      
      // Add some default watermark settings
      const defaultSettings = [
        {
          userId: defaultUser.id,
          text: "Not for AI training",
          position: "bottom-right",
          opacity: 70,
          fontSize: 24,
          exifProtection: true,
        },
        {
          userId: defaultUser.id,
          text: "© Copyright Protected",
          position: "bottom-left",
          opacity: 60,
          fontSize: 20,
          exifProtection: true,
        },
        {
          userId: defaultUser.id,
          text: "Do Not Use",
          position: "center",
          opacity: 40,
          fontSize: 36,
          exifProtection: true,
        },
      ];
      
      const insertedSettings = await db.insert(schema.watermarkSettings)
        .values(defaultSettings)
        .returning();
      
      console.log(`Added ${insertedSettings.length} default watermark settings`);
    } else {
      console.log("Default user already exists, skipping seed");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
