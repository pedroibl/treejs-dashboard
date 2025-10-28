import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp } from "lucide-react";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { useMemo } from "react";

export default function Dashboard() {
  const currentMonth = useMemo(() => new Date(), []);
  const startDate = startOfMonth(currentMonth);
  const endDate = endOfMonth(currentMonth);

  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  const { data: categorySpending, isLoading: categoryLoading } = trpc.dashboard.categorySpending.useQuery({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  const { data: recentTransactions, isLoading: transactionsLoading } = trpc.transactions.list.useQuery({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });

  const { data: categories } = trpc.categories.list.useQuery();

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getCategoryName = (categoryId: number) => {
    return categories?.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  const topExpenses = useMemo(() => {
    if (!categorySpending) return [];
    return categorySpending
      .filter(c => c.type === 'expense')
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [categorySpending]);

  if (statsLoading || categoryLoading || transactionsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Loading your financial overview...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">{format(currentMonth, 'MMMM yyyy')} Overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Income</CardTitle>
            <ArrowUpRight className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats?.totalIncome || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
            <ArrowDownRight className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats?.totalExpenses || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Balance</CardTitle>
            <Wallet className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(stats?.balance || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(stats?.balance || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Transactions</CardTitle>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats?.transactionCount || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Top Spending Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {topExpenses.length === 0 ? (
              <p className="text-gray-500 text-sm">No expenses recorded this month</p>
            ) : (
              <div className="space-y-4">
                {topExpenses.map((category) => (
                  <div key={category.categoryId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.categoryColor }}
                      />
                      <span className="text-sm font-medium">{category.categoryName}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(category.total)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {!recentTransactions || recentTransactions.length === 0 ? (
              <p className="text-gray-500 text-sm">No transactions recorded this month</p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{transaction.description || getCategoryName(transaction.categoryId)}</p>
                      <p className="text-xs text-gray-500">{format(new Date(transaction.date), 'MMM dd, yyyy')}</p>
                    </div>
                    <span className={`text-sm font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
