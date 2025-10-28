import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  categories: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const { getUserCategories } = await import("./db");
      return getUserCategories(ctx.user.id);
    }),
    create: protectedProcedure
      .input((raw: any) => raw as { name: string; type: "income" | "expense"; color: string; icon?: string })
      .mutation(async ({ ctx, input }) => {
        const { createCategory } = await import("./db");
        await createCategory({ ...input, userId: ctx.user.id });
        return { success: true };
      }),
    update: protectedProcedure
      .input((raw: any) => raw as { id: number; name?: string; color?: string; icon?: string })
      .mutation(async ({ ctx, input }) => {
        const { updateCategory } = await import("./db");
        const { id, ...data } = input;
        await updateCategory(id, ctx.user.id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input((raw: any) => raw as { id: number })
      .mutation(async ({ ctx, input }) => {
        const { deleteCategory } = await import("./db");
        await deleteCategory(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  transactions: router({
    list: protectedProcedure
      .input((raw: any) => raw as { startDate?: string; endDate?: string; categoryId?: number; type?: string } | undefined)
      .query(async ({ ctx, input }) => {
        const { getUserTransactions } = await import("./db");
        const filters = input ? {
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
          categoryId: input.categoryId,
          type: input.type,
        } : undefined;
        return getUserTransactions(ctx.user.id, filters);
      }),
    create: protectedProcedure
      .input((raw: any) => raw as { categoryId: number; amount: number; description?: string; type: "income" | "expense"; date: string })
      .mutation(async ({ ctx, input }) => {
        const { createTransaction } = await import("./db");
        await createTransaction({ ...input, userId: ctx.user.id, date: new Date(input.date) });
        return { success: true };
      }),
    update: protectedProcedure
      .input((raw: any) => raw as { id: number; categoryId?: number; amount?: number; description?: string; date?: string })
      .mutation(async ({ ctx, input }) => {
        const { updateTransaction } = await import("./db");
        const { id, ...data } = input;
        const updateData = { ...data, ...(data.date ? { date: new Date(data.date) } : {}) };
        await updateTransaction(id, ctx.user.id, updateData);
        return { success: true };
      }),
    delete: protectedProcedure
      .input((raw: any) => raw as { id: number })
      .mutation(async ({ ctx, input }) => {
        const { deleteTransaction } = await import("./db");
        await deleteTransaction(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  budgets: router({
    list: protectedProcedure
      .input((raw: any) => raw as { month?: string } | undefined)
      .query(async ({ ctx, input }) => {
        const { getUserBudgets } = await import("./db");
        return getUserBudgets(ctx.user.id, input?.month);
      }),
    create: protectedProcedure
      .input((raw: any) => raw as { categoryId: number; amount: number; month: string })
      .mutation(async ({ ctx, input }) => {
        const { createBudget } = await import("./db");
        await createBudget({ ...input, userId: ctx.user.id });
        return { success: true };
      }),
    update: protectedProcedure
      .input((raw: any) => raw as { id: number; amount?: number; month?: string })
      .mutation(async ({ ctx, input }) => {
        const { updateBudget } = await import("./db");
        const { id, ...data } = input;
        await updateBudget(id, ctx.user.id, data);
        return { success: true };
      }),
    delete: protectedProcedure
      .input((raw: any) => raw as { id: number })
      .mutation(async ({ ctx, input }) => {
        const { deleteBudget } = await import("./db");
        await deleteBudget(input.id, ctx.user.id);
        return { success: true };
      }),
  }),

  dashboard: router({
    stats: protectedProcedure
      .input((raw: any) => raw as { startDate: string; endDate: string })
      .query(async ({ ctx, input }) => {
        const { getDashboardStats } = await import("./db");
        return getDashboardStats(ctx.user.id, new Date(input.startDate), new Date(input.endDate));
      }),
    categorySpending: protectedProcedure
      .input((raw: any) => raw as { startDate: string; endDate: string })
      .query(async ({ ctx, input }) => {
        const { getCategorySpending } = await import("./db");
        return getCategorySpending(ctx.user.id, new Date(input.startDate), new Date(input.endDate));
      }),
  }),
});

export type AppRouter = typeof appRouter;
