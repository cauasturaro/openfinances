import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, 
  startOfWeek, endOfWeek, eachWeekOfInterval, eachMonthOfInterval, 
  startOfYear, endOfYear, getWeek, isSameWeek, getYear, isSameMonth
} from "date-fns";

import { TransactionService, type Transaction, type DashboardSummary } from "@/services/TransactionService";
import { CreateTransactionDialog } from "@/components/dashboard/CreateTransactionDialog"; 
import { ManageDataDialog } from "@/components/dashboard/ManageDataDialog";
import { TransactionDetailsDialog } from "@/components/dashboard/TransactionDetailsDialog"; 
import { useAuth } from "@/contexts/AuthContext";

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Icons
import { DollarSign, ArrowUpCircle, ArrowDownCircle, LogOut, User as UserIcon, TrendingUp, Calendar as CalendarIcon, Wallet, Filter, Trash2, Loader2, ArrowUpRight, ArrowDownLeft } from "lucide-react";

// Charts
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

type Scope = "week" | "month" | "year";
type Granularity = "day" | "week" | "month";

interface UserData {
  name: string;
  email: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [loading, setLoading] = useState(true);

// User data  
  const [user, setUser] = useState<UserData | null>(null);

  // Data
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<{id: number, name: string, color: string}[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<{id: number, name: string}[]>([]);
  const [summary, setSummary] = useState<DashboardSummary>({ balance: 0, income: 0, expense: 0 });

  // Selected transaction
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Filtros
  const [chartScope, setChartScope] = useState<Scope>("month"); 
  const [chartGranularity, setChartGranularity] = useState<Granularity>("day");
  const [chartType, setChartType] = useState("balance"); 


  // CARREGANDO DADOS
  const loadData = async () => {
    try {
      const [transData, catData, payData] = await Promise.all([
        TransactionService.getAll(),
        TransactionService.getCategories(),
        TransactionService.getPaymentMethods()
      ]);

      setTransactions(transData);
      setCategories(catData);
      setPaymentMethods(payData);
      setSummary(TransactionService.calculateSummary(transData));
    } catch (error) {
      console.error("Error loading dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  // SETANDO USUÁRIO
  useEffect(() => { 
    loadData();
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user data");
      }
    }
  }, []);

  // ESCOPO DO GRÁFICO (e granularidade default)
  useEffect(() => {
    if (chartScope === "week") setChartGranularity("day");
    if (chartScope === "month") setChartGranularity("day");
    if (chartScope === "year") setChartGranularity("month");
  }, [chartScope]);

  // HANDLER DE CRIAR TRANSAÇÃO
  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailsOpen(true);
  };

  // HANDLER DE DELETAR TRANSAÇÃO
  const handleDeleteFromList = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); 
    setDeletingId(id);
    try {
      await TransactionService.deleteTransaction(id);
      await loadData();
    } catch (error) {
      console.error("Failed to delete", error);
    } finally {
      setDeletingId(null);
    }
  };

  // HANDLER DE LOGOUT
  const handleLogout = () => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('user');
    logout(); 
    navigate("/login");
  };

  // FUNÇÃO PARA PEGAR INICIAIS DO NOME DE USUÁRIO
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // GRÁFICO (dados)
  const chartData = useMemo(() => {
    if (transactions.length === 0) return [];

    const today = new Date(); 
    let start, end;
    let dataPoints: Date[] = [];

    // SETANDO ESCOPO
    if (chartScope === 'week') { start = startOfWeek(today, { weekStartsOn: 1 }); end = endOfWeek(today, { weekStartsOn: 1 }); }
    else if (chartScope === 'month') { start = startOfMonth(today); end = endOfMonth(today); }
    else { start = startOfYear(today); end = endOfYear(today); }

    // AO SETAR GRANULARIDADE MANUALMENTE
    if (chartGranularity === 'day') dataPoints = eachDayOfInterval({ start, end });
    else if (chartGranularity === 'week') dataPoints = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
    else dataPoints = eachMonthOfInterval({ start, end });

    return dataPoints.map((point) => { 
      let label = "";
      let fullDateLabel = "";
      const bucketTransactions = transactions.filter(t => { 
        const tDate = new Date(t.date); // FILTRA E DEFINE LABELS DE TRANSAÇÕES DE ACORDO COM A GRANULARIDADE (dia, semana ou mês)
        if (chartGranularity === 'day') { // DIA
           label = format(point, 'dd');
           fullDateLabel = format(point, 'MMM dd, yyyy');
           return isSameDay(tDate, point);
        } else if (chartGranularity === 'week') { // SEMANA
           label = `W${getWeek(point, { weekStartsOn: 1 })}`;
           fullDateLabel = `Week ${getWeek(point)}`;
           return isSameWeek(tDate, point, { weekStartsOn: 1 }) && getYear(tDate) === getYear(point);
        } else { // ANO
           label = format(point, 'MMM');
           fullDateLabel = format(point, 'MMMM yyyy');
           return isSameMonth(tDate, point);
        }
      });

      let income = 0;
      let expense = 0;
      // SETANDO VALORES DE INCOME E EXPENSE
      bucketTransactions.forEach(t => {
        if (t.amount > 0) income += t.amount; else expense += Math.abs(t.amount);
      });
      
      // RETORNO FINAL COM INFORMAÇÕES TOTAIS
      return {
        name: label,
        fullDate: fullDateLabel,
        income, expense,
        balance: income - expense,
        total: chartType === 'income' ? income : (chartType === 'expense' ? expense : income - expense)
      };
    });
  }, [transactions, chartScope, chartGranularity, chartType]);

  // FORMATANDO DATA E MOEDA
  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'short' });

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 font-sans pb-20">
      {/*HEADER*/}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-emerald-200/50 shadow-md">
              <DollarSign className="text-white h-5 w-5" strokeWidth={3} />
            </div>
            <span className="hidden md:block font-bold text-xl tracking-tight text-zinc-900 dark:text-white">OpenFinances</span>
          </div>

          <div className="flex items-center gap-3">
            {/*BOTÃO DE GERENCIAR RÓTULOS*/}
            <ManageDataDialog categories={categories} paymentMethods={paymentMethods} onUpdate={loadData} />
            {/*BOTÃO DO DIÁLOGO DE CRIAR TRANSAÇÃO*/}
            <CreateTransactionDialog onSuccess={loadData} categories={categories} paymentMethods={paymentMethods} onDataUpdate={loadData} />
            
            {/*INFORMAÇÕES DO USUÁRIO + botão de sair*/}
            <DropdownMenu>
              {/*AVATAR CLICÁVEL COM DROPDOWN*/}
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-zinc-200 hover:bg-zinc-100">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-medium">
                      {user ? getInitials(user.name) : <UserIcon className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                {/*NOME + EMAIL*/}
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email || 'Loading...'}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/*LOGOUT*/}
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/*CONTEÚDO CENTRAL*/}
      <main className="container mx-auto px-4 md:px-6 py-8 space-y-8">
        
        {/*TOTAL BALANCE, INCOME E EXPENSES*/}
        <div className="grid gap-6 md:grid-cols-3">
          {/*BALANCE*/}
          <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Balance</CardTitle>
              <Wallet className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-30" /> : (
                <div className={`text-3xl font-bold tracking-tight ${summary.balance >= 0 ? 'text-zinc-900 dark:text-zinc-100' : 'text-red-600'}`}>
                  {formatCurrency(summary.balance)}
                </div>
              )}
            </CardContent>
          </Card>
            
          {/*INCOME*/}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-30" /> : (
                <div className="text-2xl font-bold text-emerald-600">{formatCurrency(summary.income)}</div>
              )}
            </CardContent>
          </Card>
          
          {/*EXPENSES*/}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-30" /> : (
                <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.expense)}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-7">
          {/*----- GRÁFICO -----*/}
          <Card className="col-span-4 shadow-sm h-full flex flex-col min-h-100">
            {/* HEADER DO GRÁFICO */}
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                  {/*TÍTULO*/}
                  <div>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-zinc-500" />
                      Cash Flow
                    </CardTitle>
                    <CardDescription>Visualizing your finances</CardDescription>
                  </div>

                  {/*FILTRO DE ESCOPO*/}
                  <Select value={chartScope} onValueChange={(v) => setChartScope(v as Scope)}>
                    <SelectTrigger className="w-35"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>

                </div>

                {/*FILTRO DE GRANULARIDADE*/}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                   <Filter className="h-3 w-3" /> <span>View by:</span>
                   <div className="flex gap-1">
                      {chartScope === 'week' && <Badge variant="secondary" className="cursor-default">Days</Badge>}
                      {(chartScope === 'month' || chartScope === 'year') && (
                        <>
                          <Button variant={chartGranularity === 'day' ? 'secondary' : 'ghost'} size="sm" className="h-6 px-2 text-xs" onClick={() => setChartGranularity('day')}>Days</Button>
                          <Button variant={chartGranularity === 'week' ? 'secondary' : 'ghost'} size="sm" className="h-6 px-2 text-xs" onClick={() => setChartGranularity('week')}>Weeks</Button>
                          {chartScope === 'year' && <Button variant={chartGranularity === 'month' ? 'secondary' : 'ghost'} size="sm" className="h-6 px-2 text-xs" onClick={() => setChartGranularity('month')}>Months</Button>}
                        </>
                      )}
                   </div>
                </div>
              </div>
            </CardHeader>
            
            {/*CONTEÚDO CENTRAL DO GRÁFICO*/}
            <CardContent className="flex-1 min-h-75">
              <Tabs defaultValue="balance" className="w-full h-full flex flex-col" onValueChange={setChartType}>
                {/*SELEÇÃO DE VISUALIZAÇÃO (BALANCE, INCOME, EXPENSES)*/}
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="balance">Balance</TabsTrigger>
                  <TabsTrigger value="income" className="data-[state=active]:text-emerald-600">Income</TabsTrigger>
                  <TabsTrigger value="expense" className="data-[state=active]:text-red-600">Expenses</TabsTrigger>
                </TabsList>

                {/*GRÁFICO EM SI*/}
                <div className="flex-1 w-full min-h-62.5">
                  <ResponsiveContainer width="100%" height="100%">
                    {/*VELAS DO GRÁFICO*/}
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      {/*GRID X (TEMPO) E Y (VALOR)*/}
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E4E7" />
                      <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />

                      {/*TOOLTIP (HOVER)*/}  
                      <Tooltip 
                        cursor={{fill: '#f4f4f5'}} // COR DE FUNDO DA VELA NO HOVER
                        content={({ active, payload }) => { 
                          if (active && payload && payload.length) {
                             const data = payload[0].payload;
                             return (
                               <div className="bg-white p-3 border border-zinc-200 rounded-lg shadow-lg text-sm z-50">
                                 <p className="font-semibold mb-2 text-zinc-900 border-b pb-1">{data.fullDate}</p>
                                 <div className="space-y-1">
                                    <p className="text-emerald-600 flex justify-between gap-4">
                                      <span>Income:</span>
                                      <span>{formatCurrency(data.income)}</span>
                                    </p>
                                    <p className="text-red-600 flex justify-between gap-4">
                                      <span>Expense:</span>
                                      <span>{formatCurrency(data.expense)}</span>
                                    </p>
                                    <div className="border-t pt-1 mt-1 font-bold text-zinc-900 flex justify-between gap-4">
                                      <span>Balance:</span>
                                      <span>{formatCurrency(data.balance)}</span>
                                    </div>
                                 </div>
                               </div>
                             )
                          }
                          return null;
                        }}
                      />
                      {/*SETTER DE CORES DAS VELAS DE ACORDDO COM TIPO*/}
                      {chartType === 'balance' && <Bar dataKey="balance" fill="#3f3f46" radius={[4, 4, 4, 4]} barSize={40} />}
                      {chartType === 'income' && <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />}
                      {chartType === 'expense' && <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Tabs>
            </CardContent>
          </Card>

          {/*----- HISTÓRICO -----*/}
          <Card className="col-span-4 md:col-span-3 shadow-sm h-full flex flex-col">
            {/*HEADER*/}
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarIcon className="h-5 w-5 text-zinc-500" />
                History
              </CardTitle>
            </CardHeader>

            {/*CONTEÚDO PRINCIPAL*/}
            <CardContent className="flex-1 overflow-auto pr-1 max-h-125">
              {/*NO LOADING, FICA 3 TRAÇOS VAZIOS DE TRANSAÇÃO NO INTERIOR DO CARD*/}
              {loading ? (
                 <div className="space-y-4">
                   <Skeleton className="h-14 w-full rounded-xl" />
                   <Skeleton className="h-14 w-full rounded-xl" />
                   <Skeleton className="h-14 w-full rounded-xl" />
                 </div>
              ) : (
                <div className="space-y-2">
                  {/*EXIBIÇÃO DE TRANSAÇÕES*/}
                  {transactions.map((transaction) => (
                    // SET DE KEY E onClick
                    <div 
                      key={transaction.id} 
                      onClick={() => handleTransactionClick(transaction)}
                      className="group flex items-center justify-between p-3 bg-white hover:bg-zinc-50 rounded-xl border border-zinc-100 transition-all hover:shadow-sm cursor-pointer active:scale-[0.98] gap-3"
                    >
                      {/*TRANSAÇÃO EM SI*/}
                      <div className="flex items-center gap-3 overflow-hidden">
                        {/*ÍCONE DE SETA DE ACORDO COM O VALOR*/}
                        <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${transaction.amount > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                          {transaction.amount > 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownLeft className="h-5 w-5" />}
                        </div>

                        <div className="flex flex-col min-w-0">
                          {/*DESCRIÇÃO (TÍTULO)*/}
                          <span className="font-semibold text-sm text-zinc-900 truncate">
                            {transaction.description}
                          </span>

                          {/*CATEGORIA E MÉTODO DE PAGAMENTO*/}
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                             <Badge 
                                variant="outline" 
                                className="px-1.5 py-0 rounded text-[10px] font-normal uppercase tracking-wide border-0 truncate max-w-24 sm:max-w-none text-white"
                                style={{ backgroundColor: transaction.category?.color || '#52525b' }} 
                             >
                                {transaction.category?.name}
                             </Badge>
                             <span className="w-1 h-1 bg-zinc-300 rounded-full shrink-0" />
                             <span 
                                className="truncate max-w-24 sm:max-w-none font-medium"
                             >
                                {transaction.paymentMethod?.name}
                             </span>
                          </div>
                        </div>
                      </div>

                      {/*DIREITA DA TRANSAÇÃO*/}
                      <div className="flex items-center gap-3 shrink-0">
                        {/*VALOR E DATA DA TRANSAÇÃO*/} 
                        <div className="text-right">
                            <div className={`font-bold text-sm ${transaction.amount < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                              {transaction.amount > 0 ? '+' : ''} {formatCurrency(transaction.amount)}
                            </div>
                            <span className="text-[11px] text-muted-foreground block">
                              {formatDate(transaction.date)}
                            </span>
                        </div>

                        {/*BOTÃO DE DELETAR NO HOVER*/}
                        <div className="hidden sm:block w-8">
                          <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all"
                              onClick={(e) => handleDeleteFromList(e, transaction.id)}
                              disabled={deletingId === transaction.id}
                          >
                              {deletingId === transaction.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/*CASO NÃO HAJA TRANSAÇÃO NENHUMA*/}
                  {transactions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                      <div className="h-12 w-12 bg-zinc-100 rounded-full flex items-center justify-center">
                         <DollarSign className="h-6 w-6 text-zinc-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-zinc-900">No transactions</p>
                        <p className="text-sm text-muted-foreground max-w-50">Add your first income or expense to see data here.</p>
                      </div>
                      <CreateTransactionDialog onSuccess={loadData} categories={categories} paymentMethods={paymentMethods} onDataUpdate={loadData} />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/*DIALOG DE DETALHES DE TRANSAÇÃO*/}
      <TransactionDetailsDialog 
        transaction={selectedTransaction}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onDelete={loadData}
      />
    </div>
  );
}