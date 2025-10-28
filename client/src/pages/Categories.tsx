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
import { useState } from "react";
import { toast } from "sonner";

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e",
];

export default function Categories() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const { data: categories, isLoading, refetch } = trpc.categories.list.useQuery();

  const createMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsAddOpen(false);
      toast.success("Category created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create category: " + error.message);
    },
  });

  const updateMutation = trpc.categories.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditingCategory(null);
      toast.success("Category updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update category: " + error.message);
    },
  });

  const deleteMutation = trpc.categories.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Category deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete category: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      type: formData.get('type') as "income" | "expense",
      color: formData.get('color') as string,
      icon: formData.get('icon') as string || undefined,
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this category? This may affect existing transactions.')) {
      deleteMutation.mutate({ id });
    }
  };

  const incomeCategories = categories?.filter(c => c.type === 'income') || [];
  const expenseCategories = categories?.filter(c => c.type === 'expense') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 mt-1">Organize your transactions with custom categories</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Groceries, Salary"
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2 flex-wrap mt-2">
                  {PRESET_COLORS.map(color => (
                    <label key={color} className="cursor-pointer">
                      <input
                        type="radio"
                        name="color"
                        value={color}
                        className="sr-only peer"
                        required
                      />
                      <div
                        className="w-8 h-8 rounded-full border-2 border-transparent peer-checked:border-gray-900 peer-checked:ring-2 peer-checked:ring-gray-300"
                        style={{ backgroundColor: color }}
                      />
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="icon">Icon (optional)</Label>
                <Input
                  id="icon"
                  name="icon"
                  placeholder="e.g., 🛒, 💰"
                />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Category"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Income Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Income Categories ({incomeCategories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading categories...</div>
          ) : incomeCategories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No income categories yet</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {incomeCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <p className="font-medium">{category.icon} {category.name}</p>
                      <p className="text-xs text-gray-500">Income</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingCategory(category)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Categories ({expenseCategories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading categories...</div>
          ) : expenseCategories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No expense categories yet</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {expenseCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <p className="font-medium">{category.icon} {category.name}</p>
                      <p className="text-xs text-gray-500">Expense</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingCategory(category)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Category Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingCategory.name}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-type">Type</Label>
                <Select name="type" defaultValue={editingCategory.type} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-color">Color</Label>
                <div className="flex gap-2 flex-wrap mt-2">
                  {PRESET_COLORS.map(color => (
                    <label key={color} className="cursor-pointer">
                      <input
                        type="radio"
                        name="color"
                        value={color}
                        defaultChecked={color === editingCategory.color}
                        className="sr-only peer"
                        required
                      />
                      <div
                        className="w-8 h-8 rounded-full border-2 border-transparent peer-checked:border-gray-900 peer-checked:ring-2 peer-checked:ring-gray-300"
                        style={{ backgroundColor: color }}
                      />
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="edit-icon">Icon (optional)</Label>
                <Input
                  id="edit-icon"
                  name="icon"
                  defaultValue={editingCategory.icon || ''}
                />
              </div>
              <Button type="submit" className="w-full" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Update Category"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
