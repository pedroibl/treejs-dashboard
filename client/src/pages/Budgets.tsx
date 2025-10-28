import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState, useMemo } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export default function Budgets() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));

  const { data: budgets, isLoading, refetch } = trpc.budgets.list.useQuery({ month: selectedMonth });
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: transactions } = trpc.transactions.list.useQuery({
    startDate: startOfMonth(new Date(selectedMonth)).toISOString(),
    endDate: endOfMonth(new Date(selectedMonth)).toISOString(),
  });

  const createMutation = trpc.budgets.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsAddOpen(false);
      toast.success("Budget created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create budget: " + error.message);
    },
  });

  const updateMutation = trpc.budgets.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditingBudget(null);
      toast.success("Budget updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update budget: " + error.message);
    },
  });

  const deleteMutation = trpc.budgets.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Budget deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete budget: " + error.message);
    },
  });

  const budgetData = useMemo(() => {
    if (!budgets || !transactions || !categories) return [];
    
    return budgets.map(budget => {
      const category = categories.find(c => c.id === budget.categoryId);
      const spent = transactions
        .filter(t => t.categoryId === budget.categoryId && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      
      return {
        ...budget,
        categoryName: category?.name || 'Unknown',
        categoryColor: category?.color || '#999999',
        spent,
        remaining: budget.amount - spent,
        percentage: Math.min(percentage, 100),
      };
    });
  }, [budgets, transactions, categories]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      categoryId: parseInt(formData.get('categoryId') as string),
      amount: Math.round(parseFloat(formData.get('amount') as string) * 100),
      month: selectedMonth,
    };

    if (editingBudget) {
      updateMutation.mutate({ id: editingBudget.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this budget?')) {
      deleteMutation.mutate({ id });
    }
  };

  const expenseCategories = categories?.filter(c => c.type === 'expense') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
          <p className="text-gray-500 mt-1">Set and track spending limits by category</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Budget</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="categoryId">Category</Label>
                <Select name="categoryId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="amount">Budget Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Budget"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Month Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Label>Month</Label>
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Budgets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-2 text-center py-8 text-gray-500">Loading budgets...</div>
        ) : budgetData.length === 0 ? (
          <div className="col-span-2 text-center py-8 text-gray-500">
            No budgets set for this month. Create one to get started!
          </div>
        ) : (
          budgetData.map((budget) => (
            <Card key={budget.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: budget.categoryColor }}
                    />
                    <CardTitle className="text-lg">{budget.categoryName}</CardTitle>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingBudget(budget)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(budget.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Spent</span>
                    <span className="font-semibold">{formatCurrency(budget.spent)}</span>
                  </div>
                  <Progress 
                    value={budget.percentage} 
                    className={budget.percentage > 100 ? "bg-red-100" : ""}
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Budget</span>
                    <span className="font-semibold">{formatCurrency(budget.amount)}</span>
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Remaining</span>
                    <span className={`text-lg font-bold ${budget.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(Math.abs(budget.remaining))}
                      {budget.remaining < 0 && ' over'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingBudget} onOpenChange={(open) => !open && setEditingBudget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget</DialogTitle>
          </DialogHeader>
          {editingBudget && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit-categoryId">Category</Label>
                <Select name="categoryId" defaultValue={editingBudget.categoryId.toString()} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-amount">Budget Amount</Label>
                <Input
                  id="edit-amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  defaultValue={(editingBudget.amount / 100).toFixed(2)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Update Budget"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
