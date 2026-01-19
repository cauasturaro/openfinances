import { useState } from "react";
import { TransactionService } from "@/services/TransactionService";
import { CalendarIcon, Loader2, PlusCircle, Plus } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ManageDataDialog } from "./ManageDataDialog";

interface CreateTransactionDialogProps {
  onSuccess: () => void;
  categories: { id: number; name: string }[];
  paymentMethods: { id: number; name: string }[];
  onDataUpdate: () => void;
}

export function CreateTransactionDialog({ onSuccess, categories, paymentMethods, onDataUpdate }: CreateTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [manageOpen, setManageOpen] = useState(false);
  const [manageTab, setManageTab] = useState<"categories" | "payment-methods">("categories");

  const [type, setType] = useState<"income" | "expense">("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [categoryId, setCategoryId] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !amount || !categoryId || !paymentMethodId) return;

    setLoading(true);
    try {
      const finalAmount = parseFloat(amount.replace(',', '.')) * (type === 'expense' ? -1 : 1);

      await TransactionService.create({
        description,
        amount: finalAmount,
        date: date,
        categoryId: Number(categoryId),
        paymentMethodId: Number(paymentMethodId),
      });

      setOpen(false);
      onSuccess(); 
      resetForm();
    } catch (error) {
      console.error("Error creating transaction", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDescription("");
    setAmount("");
    setDate(new Date());
    setType("expense");
    setCategoryId("");
    setPaymentMethodId("");
  };

  const handleOpenManage = (tab: "categories" | "payment-methods") => {
    setManageTab(tab);
    setManageOpen(true);
  };

  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["e", "E", "+", "-"].includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all">
            <PlusCircle className="h-4 w-4" />
            New Transaction
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>New Transaction</DialogTitle>
            <DialogDescription>
              Record a new financial entry.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4 p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
               <button
                 type="button"
                 onClick={() => setType('income')}
                 className={cn(
                   "flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                   type === 'income' 
                     ? "bg-white dark:bg-zinc-950 text-emerald-600 shadow-sm ring-1 ring-black/5 dark:ring-white/10" 
                     : "text-muted-foreground hover:text-foreground hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50"
                 )}
               >
                 <ArrowUpIcon className="h-4 w-4" /> Income
               </button>
               <button
                 type="button"
                 onClick={() => setType('expense')}
                 className={cn(
                   "flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                   type === 'expense' 
                     ? "bg-white dark:bg-zinc-950 text-red-600 shadow-sm ring-1 ring-black/5 dark:ring-white/10" 
                     : "text-muted-foreground hover:text-foreground hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50"
                 )}
               >
                 <ArrowDownIcon className="h-4 w-4" /> Expense
               </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input 
                  id="description" 
                  placeholder="e.g. Weekly Groceries" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className={cn(
                    "absolute left-3 top-3 font-medium",
                    type === 'income' ? "text-emerald-600" : "text-red-600"
                  )}>$</span>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="0.00" 
                    className={cn(
                      "pl-7 h-11 text-lg font-semibold tracking-tight",
                      type === 'income' ? "text-emerald-600" : "text-red-600"
                    )}
                    step="0.01"
                    min="0"
                    onKeyDown={handleAmountKeyDown}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full h-11 justify-start text-left font-normal text-base",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: enUS }) : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="p-6"
                    classNames={{
                        caption: "flex justify-center pt-1 relative items-center text-lg font-semibold mb-4",
                        head_cell: "text-muted-foreground rounded-md w-12 font-normal text-[0.9rem]",
                        cell: "h-12 w-12 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: cn(
                          "h-12 w-12 p-0 font-normal aria-selected:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-base"
                        ),
                        day_selected:
                          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                        day_today: "bg-accent text-accent-foreground",
                        day_outside:
                          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                        day_disabled: "text-muted-foreground opacity-50",
                        day_range_middle:
                          "aria-selected:bg-accent aria-selected:text-accent-foreground",
                        day_hidden: "invisible",
                      }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <div className="flex gap-2">
                  <Select onValueChange={setCategoryId} value={categoryId} required>
                    <SelectTrigger className="w-full h-11">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    size="icon" 
                    variant="outline" 
                    className="h-11 w-11 shrink-0"
                    onClick={() => handleOpenManage('categories')}
                    title="Add Category"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Payment Method</Label>
                <div className="flex gap-2">
                  <Select onValueChange={setPaymentMethodId} value={paymentMethodId} required>
                    <SelectTrigger className="w-full h-11">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((pm) => (
                        <SelectItem key={pm.id} value={String(pm.id)}>{pm.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    type="button" 
                    size="icon" 
                    variant="outline" 
                    className="h-11 w-11 shrink-0"
                    onClick={() => handleOpenManage('payment-methods')}
                    title="Add Payment Method"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="submit" className="w-full h-12 text-lg font-medium shadow-md" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                Confirm Transaction
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ManageDataDialog 
        open={manageOpen} 
        onOpenChange={setManageOpen} 
        defaultTab={manageTab}
        categories={categories}
        paymentMethods={paymentMethods}
        onUpdate={onDataUpdate}
        trigger={<span className="hidden"></span>} 
      />
    </>
  );
}

// Helper icons
function ArrowUpIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
}
function ArrowDownIcon(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>
}