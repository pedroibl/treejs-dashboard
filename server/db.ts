import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Categories
export async function getUserCategories(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const { categories } = await import("../drizzle/schema");
  return db.select().from(categories).where(eq(categories.userId, userId));
}

export async function createCategory(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { categories } = await import("../drizzle/schema");
  await db.insert(categories).values(data);
}

export async function updateCategory(id: number, userId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { categories } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  await db.update(categories).set(data).where(and(eq(categories.id, id), eq(categories.userId, userId)));
}

export async function deleteCategory(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { categories } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  await db.delete(categories).where(and(eq(categories.id, id), eq(categories.userId, userId)));
}

// Transactions
export async function getUserTransactions(userId: number, filters?: { startDate?: Date; endDate?: Date; categoryId?: number; type?: string }) {
  const db = await getDb();
  if (!db) return [];
  const { transactions } = await import("../drizzle/schema");
  const { and, gte, lte } = await import("drizzle-orm");
  
  const conditions = [eq(transactions.userId, userId)];
  if (filters?.startDate) conditions.push(gte(transactions.date, filters.startDate));
  if (filters?.endDate) conditions.push(lte(transactions.date, filters.endDate));
  if (filters?.categoryId) conditions.push(eq(transactions.categoryId, filters.categoryId));
  if (filters?.type) conditions.push(eq(transactions.type, filters.type as any));
  
  return db.select().from(transactions).where(and(...conditions)).orderBy(transactions.date);
}

export async function createTransaction(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { transactions } = await import("../drizzle/schema");
  await db.insert(transactions).values(data);
}

export async function updateTransaction(id: number, userId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { transactions } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  await db.update(transactions).set(data).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
}

export async function deleteTransaction(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { transactions } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  await db.delete(transactions).where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
}

// Budgets
export async function getUserBudgets(userId: number, month?: string) {
  const db = await getDb();
  if (!db) return [];
  const { budgets } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  
  const conditions = [eq(budgets.userId, userId)];
  if (month) conditions.push(eq(budgets.month, month));
  
  return db.select().from(budgets).where(and(...conditions));
}

export async function createBudget(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { budgets } = await import("../drizzle/schema");
  await db.insert(budgets).values(data);
}

export async function updateBudget(id: number, userId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { budgets } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  await db.update(budgets).set(data).where(and(eq(budgets.id, id), eq(budgets.userId, userId)));
}

export async function deleteBudget(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const { budgets } = await import("../drizzle/schema");
  const { and } = await import("drizzle-orm");
  await db.delete(budgets).where(and(eq(budgets.id, id), eq(budgets.userId, userId)));
}

// Analytics
export async function getDashboardStats(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return { totalIncome: 0, totalExpenses: 0, balance: 0, transactionCount: 0 };
  const { transactions } = await import("../drizzle/schema");
  const { and, gte, lte, sum, count } = await import("drizzle-orm");
  
  const allTransactions = await db.select().from(transactions).where(
    and(
      eq(transactions.userId, userId),
      gte(transactions.date, startDate),
      lte(transactions.date, endDate)
    )
  );
  
  const totalIncome = allTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = allTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  
  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    transactionCount: allTransactions.length
  };
}

export async function getCategorySpending(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  const { transactions, categories } = await import("../drizzle/schema");
  const { and, gte, lte } = await import("drizzle-orm");
  
  const allTransactions = await db.select({
    categoryId: transactions.categoryId,
    categoryName: categories.name,
    categoryColor: categories.color,
    amount: transactions.amount,
    type: transactions.type,
  }).from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id))
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate)
      )
    );
  
  const categoryMap = new Map();
  allTransactions.forEach(t => {
    const key = t.categoryId;
    if (!categoryMap.has(key)) {
      categoryMap.set(key, {
        categoryId: t.categoryId,
        categoryName: t.categoryName || 'Unknown',
        categoryColor: t.categoryColor || '#999999',
        total: 0,
        type: t.type
      });
    }
    categoryMap.get(key).total += t.amount;
  });
  
  return Array.from(categoryMap.values());
}
