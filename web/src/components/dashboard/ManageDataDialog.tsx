// REACT
import { useState, useEffect } from "react";
// SERVICES
import { TransactionService } from "@/services/TransactionService";
// LUCIDE REACT
import { Loader2, Plus, Tag, CreditCard, Trash2, AlertCircle, Check } from "lucide-react";
// COMPONENTES
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981", 
  "#06b6d4", "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#71717a",
];

// PROPS PARA LISTAR ITENS
interface RemovableItemProps {
  id: number;
  name: string;
  color?: string; 
  icon: React.ReactNode;
  onDelete: (id: number) => Promise<void>;
}

// ITEM
function RemovableItem({ id, name, color, icon, onDelete }: RemovableItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // HANDLER DE DELETAR ITEM 
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(id);
    } catch (error) {
      console.error("Failed to delete", error);
      setIsDeleting(false); 
    }
  };

  // ITEM
  return (
    <div className="group flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm mb-2 last:mb-0">
      <div className="flex items-center gap-3 overflow-hidden">
        {/*ÍCONE*/} 
        <div 
          className={cn(
            "p-2 rounded-md transition-colors shadow-sm",
            color ? "text-white" : "text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800"
          )}
          style={color ? { backgroundColor: color } : {}}
        >
          {icon}
        </div>
        {/*DESCRIÇÃO*/} 
        <span className="text-sm font-medium truncate text-zinc-700 dark:text-zinc-300">
          {name}
        </span>
      </div>
      {/*BOTÃO DE DELETAR*/} 
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
 // PROPS DO DIALOG
interface ManageDataDialogProps {
  categories: { id: number; name: string; color: string }[];
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
  const [selectedColor, setSelectedColor] = useState(COLORS[4]); 
  const [activeTab, setActiveTab] = useState(defaultTab);

  // SETTER DE TAB
  useEffect(() => {
    if (showOpen) {
      setActiveTab(defaultTab);
    }
  }, [showOpen, defaultTab]);

  // CRIAR NOVO ITEM (CATEGORIA OU MÉTODO DE PAGAMENTO)
  const handleCreate = async () => {
    if (!newItemName.trim()) return;
    setLoading(true);
    try {
      if (activeTab === "categories") {
        await TransactionService.createCategory(newItemName, selectedColor);
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

  // HANDLER DE DELETAR CATEGORIA
  const handleDeleteCategory = async (id: number) => {
    await TransactionService.deleteCategory(id);
    onUpdate();
  };

  // HANDLER DE DELETAR MÉTODO DE PAGAMENTO
  const handleDeletePaymentMethod = async (id: number) => {
    await TransactionService.deletePaymentMethod(id);
    onUpdate();
  };

  return (
    <Dialog open={showOpen} onOpenChange={setShowOpen}>
      {/*BOTÃO PARA ABRIR DIALOG (TRIGGER -> PARA NEW TRANSACTIONS OU DEFAULT)*/}
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2 bg-white dark:bg-zinc-900 border-dashed hover:border-solid transition-all">
            <Tag className="h-4 w-4" />
            Manage Labels
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        {/*HEADER*/}
        <div className="p-6 pb-4">
            <DialogHeader>
            <DialogTitle>Manage Classifications</DialogTitle>
            <DialogDescription>
                Add or remove categories and payment methods.
            </DialogDescription>
            </DialogHeader>
        </div>

        {/*SETTER DE TABS*/}
        <Tabs 
          defaultValue={defaultTab} 
          value={activeTab} 
          onValueChange={(v) => setActiveTab(v as any)} 
          className="w-full"
        >
          {/*LISTA DE TABS*/}
          <div className="px-6 border-b border-zinc-100 dark:border-zinc-800">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
            </TabsList>
          </div>
          
          {/*SECÇÃO DE CRIAÇÃO DE FATO*/}
          <div className="p-6 pt-4 bg-zinc-50/50 dark:bg-black/20 flex flex-col">
            <div className="flex flex-col gap-3 mb-6">
                <div className="flex gap-2">
                    {/*TÍTULO*/}  
                    <Input 
                        placeholder={`New ${activeTab === 'categories' ? 'Category' : 'Method'} name...`}
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        className="h-10 bg-white dark:bg-zinc-900 shadow-sm"
                    />
                    {/*BOTÃO DE CRIAR*/}
                    <Button 
                        onClick={handleCreate} 
                        disabled={loading || !newItemName.trim()} 
                        className="h-10 w-12 shrink-0 transition-colors"
                        style={activeTab === 'categories' ? { backgroundColor: selectedColor } : {}}
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-5 w-5" />}
                    </Button>
                </div>
                {/*CORES CASO SEJA A ABA DE CATEGORIAS*/}
                {activeTab === 'categories' && (
                  <div className="flex flex-wrap gap-2 justify-start animate-in fade-in slide-in-from-top-1 duration-200">
                      {COLORS.map((color) => (
                          <button
                              key={color}
                              onClick={() => setSelectedColor(color)}
                              className={cn(
                                  "w-6 h-6 rounded-full transition-all hover:scale-110 focus:outline-none flex items-center justify-center",
                                  selectedColor === color 
                                      ? "ring-2 ring-offset-2 ring-zinc-400 ring-offset-zinc-50 dark:ring-offset-zinc-900 scale-110" 
                                      : "opacity-70 hover:opacity-100"
                              )}
                              style={{ backgroundColor: color }}
                          >
                              {selectedColor === color && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                          </button>
                      ))}
                  </div>
                )}
            </div>
            
            {/*LISTAGEM DE ITENS JÁ EXISTENTES*/}
            <div className="flex items-center gap-2 mb-3 px-1">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                    Existing Items
                </span>
                <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                    {activeTab === 'categories' ? categories.length : paymentMethods.length}
                </span>
            </div>
            
            {/*LISTAGEM DE FATO*/}
            <ScrollArea className="h-75 w-full pr-4 rounded-md border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/30">
                <div className="p-3">
                {/*CATEGORIAS OU MÉTODOS DE PAGAMENTO*/}
                {activeTab === 'categories' ? (
                    categories.length === 0 ? (
                        <EmptyState message="No categories created yet." />
                    ) : (
                    categories.map((cat) => (
                        <RemovableItem 
                            key={cat.id} 
                            id={cat.id} 
                            name={cat.name}
                            color={cat.color} 
                            icon={<Tag className="h-3 w-3" />}
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
                            icon={<CreditCard className="h-3 w-3" />}
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

// SE NÃO HOUVER ITENS
function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-10 text-center opacity-60">
            <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{message}</p>
        </div>
    )
}