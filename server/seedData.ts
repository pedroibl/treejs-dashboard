import { getDb } from "./db";
import { categories, transactions, budgets } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const DEFAULT_CATEGORIES = [
  // Income categories
  { name: "Salary", type: "income" as const, color: "#10b981", icon: "💰" },
  { name: "Freelance", type: "income" as const, color: "#14b8a6", icon: "💼" },
  { name: "Investments", type: "income" as const, color: "#06b6d4", icon: "📈" },
  { name: "Other Income", type: "income" as const, color: "#0ea5e9", icon: "💵" },
  
  // Expense categories
  { name: "Groceries", type: "expense" as const, color: "#ef4444", icon: "🛒" },
  { name: "Rent", type: "expense" as const, color: "#f97316", icon: "🏠" },
  { name: "Utilities", type: "expense" as const, color: "#f59e0b", icon: "⚡" },
  { name: "Transportation", type: "expense" as const, color: "#eab308", icon: "🚗" },
  { name: "Entertainment", type: "expense" as const, color: "#a855f7", icon: "🎬" },
  { name: "Dining Out", type: "expense" as const, color: "#ec4899", icon: "🍽️" },
  { name: "Healthcare", type: "expense" as const, color: "#8b5cf6", icon: "🏥" },
  { name: "Shopping", type: "expense" as const, color: "#d946ef", icon: "🛍️" },
  { name: "Education", type: "expense" as const, color: "#6366f1", icon: "📚" },
  { name: "Subscriptions", type: "expense" as const, color: "#3b82f6", icon: "📱" },
];

const SAMPLE_TRANSACTIONS = [
  // Income transactions
  { categoryName: "Salary", amount: 500000, description: "Monthly salary", type: "income" as const, daysAgo: 1 },
  { categoryName: "Freelance", amount: 150000, description: "Website project", type: "income" as const, daysAgo: 5 },
  { categoryName: "Investments", amount: 25000, description: "Dividend payment", type: "income" as const, daysAgo: 10 },
  
  // Expense transactions - diverse categories
  { categoryName: "Rent", amount: 180000, description: "Monthly rent", type: "expense" as const, daysAgo: 2 },
  { categoryName: "Groceries", amount: 12500, description: "Weekly groceries", type: "expense" as const, daysAgo: 1 },
  { categoryName: "Groceries", amount: 8700, description: "Supermarket", type: "expense" as const, daysAgo: 4 },
  { categoryName: "Groceries", amount: 15200, description: "Farmers market", type: "expense" as const, daysAgo: 7 },
  { categoryName: "Utilities", amount: 15000, description: "Electricity bill", type: "expense" as const, daysAgo: 3 },
  { categoryName: "Utilities", amount: 8000, description: "Water bill", type: "expense" as const, daysAgo: 5 },
  { categoryName: "Transportation", amount: 6000, description: "Gas", type: "expense" as const, daysAgo: 2 },
  { categoryName: "Transportation", amount: 4500, description: "Parking", type: "expense" as const, daysAgo: 6 },
  { categoryName: "Transportation", amount: 12000, description: "Car maintenance", type: "expense" as const, daysAgo: 8 },
  { categoryName: "Entertainment", amount: 5000, description: "Movie tickets", type: "expense" as const, daysAgo: 3 },
  { categoryName: "Entertainment", amount: 8000, description: "Concert", type: "expense" as const, daysAgo: 9 },
  { categoryName: "Dining Out", amount: 4500, description: "Restaurant dinner", type: "expense" as const, daysAgo: 1 },
  { categoryName: "Dining Out", amount: 3200, description: "Lunch", type: "expense" as const, daysAgo: 4 },
  { categoryName: "Dining Out", amount: 6800, description: "Weekend brunch", type: "expense" as const, daysAgo: 7 },
  { categoryName: "Healthcare", amount: 15000, description: "Doctor visit", type: "expense" as const, daysAgo: 10 },
  { categoryName: "Healthcare", amount: 8500, description: "Pharmacy", type: "expense" as const, daysAgo: 12 },
  { categoryName: "Shopping", amount: 12000, description: "Clothing", type: "expense" as const, daysAgo: 5 },
  { categoryName: "Shopping", amount: 8000, description: "Electronics", type: "expense" as const, daysAgo: 11 },
  { categoryName: "Education", amount: 20000, description: "Online course", type: "expense" as const, daysAgo: 6 },
  { categoryName: "Subscriptions", amount: 1500, description: "Netflix", type: "expense" as const, daysAgo: 1 },
  { categoryName: "Subscriptions", amount: 1000, description: "Spotify", type: "expense" as const, daysAgo: 1 },
  { categoryName: "Subscriptions", amount: 2000, description: "Cloud storage", type: "expense" as const, daysAgo: 3 },
];

const SAMPLE_BUDGETS = [
  { categoryName: "Groceries", amount: 50000 },
  { categoryName: "Dining Out", amount: 20000 },
  { categoryName: "Transportation", amount: 30000 },
  { categoryName: "Entertainment", amount: 15000 },
  { categoryName: "Shopping", amount: 25000 },
  { categoryName: "Utilities", amount: 25000 },
];

export async function seedUserData(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Check if user already has categories
  const existingCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId));

  if (existingCategories.length > 0) {
    // User already has data, skip seeding
    return { seeded: false, message: "User already has categories" };
  }

  // Insert categories
  const categoryMap = new Map<string, number>();
  
  for (const cat of DEFAULT_CATEGORIES) {
    const result = await db.insert(categories).values({
      userId,
      name: cat.name,
      type: cat.type,
      color: cat.color,
      icon: cat.icon,
    });
    
    // Get the inserted category ID
    const insertedCat = await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(categories.id)
      .limit(1);
    
    if (insertedCat.length > 0) {
      categoryMap.set(cat.name, insertedCat[insertedCat.length - 1].id);
    }
  }

  // Refresh category map with all inserted categories
  const allCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId));
  
  categoryMap.clear();
  allCategories.forEach(cat => {
    categoryMap.set(cat.name, cat.id);
  });

  // Insert sample transactions
  for (const txn of SAMPLE_TRANSACTIONS) {
    const categoryId = categoryMap.get(txn.categoryName);
    if (!categoryId) continue;

    const date = new Date();
    date.setDate(date.getDate() - txn.daysAgo);

    await db.insert(transactions).values({
      userId,
      categoryId,
      amount: txn.amount,
      description: txn.description,
      type: txn.type,
      date,
    });
  }

  // Insert sample budgets for current month
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  
  for (const budget of SAMPLE_BUDGETS) {
    const categoryId = categoryMap.get(budget.categoryName);
    if (!categoryId) continue;

    await db.insert(budgets).values({
      userId,
      categoryId,
      amount: budget.amount,
      month: currentMonth,
    });
  }

  return { 
    seeded: true, 
    message: "Sample data created successfully",
    categoriesCount: DEFAULT_CATEGORIES.length,
    transactionsCount: SAMPLE_TRANSACTIONS.length,
    budgetsCount: SAMPLE_BUDGETS.length,
  };
}
