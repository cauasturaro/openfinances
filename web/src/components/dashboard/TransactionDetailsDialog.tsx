import { useState } from "react";
import { TransactionService, type Transaction } from "@/services/TransactionService";
import { Calendar, CreditCard, Tag, Trash2, ArrowUpCircle, ArrowDownCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface TransactionDetailsDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void; 
}

export function TransactionDetailsDialog({ 
  transaction, 
  open, 
  onOpenChange,
  onDelete 
}: TransactionDetailsDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!transaction) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await TransactionService.deleteTransaction(transaction.id);
      onDelete(); 
      onOpenChange(false); 
    } catch (error) {
      console.error("Failed to delete transaction", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const isIncome = transaction.amount > 0;
  const formattedAmount = new Intl.NumberFormat('en-US', { 
    style: 'currency', currency: 'USD' 
  }).format(Math.abs(transaction.amount));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-105 p-0 gap-0 overflow-hidden border-0 shadow-2xl">
        
        <div className={cn(
          "px-6 py-8 flex flex-col items-center justify-center gap-4 bg-linear-to-b",
          isIncome 
            ? "from-emerald-50 to-white dark:from-emerald-950/30 dark:to-zinc-950" 
            : "from-red-50 to-white dark:from-red-950/30 dark:to-zinc-950"
        )}>
          <div className={cn(
            "p-3 rounded-2xl shadow-sm",
            isIncome 
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400" 
              : "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400"
          )}>
            {isIncome ? <ArrowUpCircle className="h-8 w-8" /> : <ArrowDownCircle className="h-8 w-8" />}
          </div>

          <div className="text-center space-y-1">
            <DialogTitle className="text-xl font-normal text-muted-foreground">
              {transaction.description}
            </DialogTitle>
            <div className={cn(
              "text-4xl font-bold tracking-tighter",
              isIncome ? "text-emerald-600 dark:text-emerald-500" : "text-red-600 dark:text-red-500"
            )}>
              {isIncome ? '+' : '-'}{formattedAmount}
            </div>
          </div>
        </div>

        <div className="px-6 py-2 pb-6 space-y-4">
          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 p-4 space-y-4">

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="p-2 bg-white dark:bg-zinc-800 rounded-md shadow-sm">
                  <Calendar className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Date</span>
              </div>
              <span className="text-sm text-zinc-900 dark:text-zinc-100 font-medium">
                {format(new Date(transaction.date), "MMMM dd, yyyy", { locale: enUS })}
              </span>
            </div>
            
            <Separator className="bg-zinc-200 dark:bg-zinc-800" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="p-2 bg-white dark:bg-zinc-800 rounded-md shadow-sm">
                  <Tag className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Category</span>
              </div>
              
              <Badge 
                variant="outline" 
                className="font-normal px-3 py-1 text-white border-0"
                style={{ fontWeight: 'bold', backgroundColor: transaction.category?.color || '#52525b' }} 
              >
                {transaction.category?.name || "Uncategorized"}
              </Badge>
            </div>

            <Separator className="bg-zinc-200 dark:bg-zinc-800" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="p-2 bg-white dark:bg-zinc-800 rounded-md shadow-sm">
                  <CreditCard className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Payment Method</span>
              </div>
              <span className="text-sm text-zinc-900 dark:text-zinc-100 font-medium">
                {transaction.paymentMethod?.name || "Unknown"}
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-muted-foreground hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors h-9 px-3"
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            <span className="text-xs font-semibold uppercase tracking-wider">Delete</span>
          </Button>

          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}