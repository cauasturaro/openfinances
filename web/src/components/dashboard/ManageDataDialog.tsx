import { useState } from "react";
import { TransactionService } from "@/services/TransactionService";
import { Loader2, Plus, Tag, CreditCard, Trash2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RemovableItemProps {
  id: number;
  name: string;
  icon: React.ReactNode;
  onDelete: (id: number) => Promise<void>;
}

function RemovableItem({ id, name, icon, onDelete }: RemovableItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(id);
    } catch (error) {
      console.error("Failed to delete", error);
      setIsDeleting(false); 
    }
  };

  return (
    <div className="group flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
          {icon}
        </div>
        <span className="text-sm font-medium truncate text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white">
          {name}
        </span>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={isDeleting}
        className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
        title="Delete"
      >
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

interface ManageDataDialogProps {
  categories: { id: number; name: string }[];
  paymentMethods: { id: number; name: string }[];
  onUpdate: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultTab?: "categories" | "payment-methods";
  trigger?: React.ReactNode;
}

export function ManageDataDialog({ 
  categories, 
  paymentMethods, 
  onUpdate, 
  open, 
  onOpenChange, 
  defaultTab = "categories", 
  trigger 
}: ManageDataDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const showOpen = isControlled ? open : internalOpen;
  const setShowOpen = isControlled ? onOpenChange! : setInternalOpen;

  const [loading, setLoading] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleCreate = async () => {
    if (!newItemName.trim()) return;
    setLoading(true);
    try {
      if (activeTab === "categories") {
        await TransactionService.createCategory(newItemName);
      } else {
        await TransactionService.createPaymentMethod(newItemName);
      }
      setNewItemName("");
      onUpdate();
    } catch (error) {
      console.error("Error creating item", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: number) => {
    await TransactionService.deleteCategory(id);
    onUpdate();
  };

  const handleDeletePaymentMethod = async (id: number) => {
    await TransactionService.deletePaymentMethod(id);
    onUpdate();
  };

  return (
    <Dialog open={showOpen} onOpenChange={setShowOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2 bg-white dark:bg-zinc-900 border-dashed hover:border-solid transition-all">
            <Tag className="h-4 w-4" />
            Manage Labels
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-125 p-0 gap-0 overflow-hidden">
        <div className="p-6 pb-2">
            <DialogHeader>
            <DialogTitle>Manage Classifications</DialogTitle>
            <DialogDescription>
                Add or remove categories and payment methods to organize your finances.
            </DialogDescription>
            </DialogHeader>
        </div>

        <Tabs defaultValue={defaultTab} value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <div className="px-6 border-b border-zinc-100 dark:border-zinc-800">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
            </TabsList>
          </div>
          
          <div className="p-6 pt-4 bg-zinc-50/50 dark:bg-black/20 min-h-87.5 flex flex-col">
            <div className="flex gap-2 mb-6">
                <Input 
                placeholder={`New ${activeTab === 'categories' ? 'Category' : 'Method'} name...`}
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                className="h-10 bg-white dark:bg-zinc-900 shadow-sm"
                />
                <Button onClick={handleCreate} disabled={loading || !newItemName.trim()} className="h-10 w-12 shrink-0">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-5 w-5" />}
                </Button>
            </div>

            <div className="flex items-center gap-2 mb-3 px-1">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Existing Items
                </span>
                <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                    {activeTab === 'categories' ? categories.length : paymentMethods.length}
                </span>
            </div>

            <ScrollArea className="flex-1 -mr-4 pr-4">
                <div className="grid grid-cols-1 gap-2 pb-2">
                {activeTab === 'categories' ? (
                    categories.length === 0 ? (
                        <EmptyState message="No categories created yet." />
                    ) : (
                    categories.map((cat) => (
                        <RemovableItem 
                            key={cat.id} 
                            id={cat.id} 
                            name={cat.name} 
                            icon={<Tag className="h-4 w-4" />}
                            onDelete={handleDeleteCategory}
                        />
                    ))
                    )
                ) : (
                    paymentMethods.length === 0 ? (
                        <EmptyState message="No payment methods created yet." />
                    ) : (
                    paymentMethods.map((pm) => (
                        <RemovableItem 
                            key={pm.id} 
                            id={pm.id} 
                            name={pm.name} 
                            icon={<CreditCard className="h-4 w-4" />}
                            onDelete={handleDeletePaymentMethod}
                        />
                    ))
                    )
                )}
                </div>
            </ScrollArea>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg opacity-60">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{message}</p>
        </div>
    )
}