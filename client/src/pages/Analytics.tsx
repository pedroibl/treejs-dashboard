import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export default function Analytics() {
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 2), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery({
    startDate: new Date(startDate).toISOString(),
    endDate: new Date(endDate).toISOString(),
  });

  const { data: categorySpending, isLoading: categoryLoading } = trpc.dashboard.categorySpending.useQuery({
    startDate: new Date(startDate).toISOString(),
    endDate: new Date(endDate).toISOString(),
  });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const expenseData = useMemo(() => {
    if (!categorySpending) return [];
    return categorySpending
      .filter(c => c.type === 'expense' && c.total > 0)
      .map(c => ({
        name: c.categoryName,
        value: c.total / 100,
        color: c.categoryColor,
      }));
  }, [categorySpending]);

  const incomeData = useMemo(() => {
    if (!categorySpending) return [];
    return categorySpending
      .filter(c => c.type === 'income' && c.total > 0)
      .map(c => ({
        name: c.categoryName,
        value: c.total / 100,
        color: c.categoryColor,
      }));
  }, [categorySpending]);

  const comparisonData = useMemo(() => {
    if (!categorySpending) return [];
    
    const categoryMap = new Map();
    categorySpending.forEach(c => {
      if (!categoryMap.has(c.categoryName)) {
        categoryMap.set(c.categoryName, { name: c.categoryName, income: 0, expense: 0 });
      }
      const entry = categoryMap.get(c.categoryName);
      if (c.type === 'income') {
        entry.income = c.total / 100;
      } else {
        entry.expense = c.total / 100;
      }
    });
    
    return Array.from(categoryMap.values());
  }, [categorySpending]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            {formatCurrency(Math.round(payload[0].value * 100))}
          </p>
        </div>
      );
    }
    return null;
  };

  if (statsLoading || categoryLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">Loading your financial insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Visualize your spending patterns and trends</p>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats?.totalIncome || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats?.totalExpenses || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(stats?.balance || 0) >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(stats?.balance || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {expenseData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No expense data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Income Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Income Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {incomeData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No income data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={incomeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {incomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Income vs Expenses by Category */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Income vs Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {comparisonData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip
                    formatter={(value: any) => formatCurrency(Math.round(value * 100))}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#10b981" name="Income" />
                  <Bar dataKey="expense" fill="#ef4444" name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
