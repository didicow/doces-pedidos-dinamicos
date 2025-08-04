import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Download, DollarSign, Package, TrendingUp, ClipboardList } from 'lucide-react';
import { useOptions } from '@/hooks/useOptions';

// Mock data - replace with real API calls
const mockOrders = [
  {
    id: '1',
    produto: 'Brigadeiro Gourmet',
    recheio: 'Chocolate Belga',
    quantidade: 50,
    entrega: 'Retirada',
    statusPagamento: 'Pago',
    dataEntrega: '2024-08-10',
    observacao: 'Embalar separadamente'
  },
  {
    id: '2', 
    produto: 'Beijinho Premium',
    recheio: 'Coco Fresco',
    quantidade: 30,
    entrega: 'Delivery',
    statusPagamento: 'Pendente',
    dataEntrega: '2024-08-12',
    observacao: ''
  },
  {
    id: '3',
    produto: 'Casadinho',
    recheio: 'Doce de Leite',
    quantidade: 25,
    entrega: 'Retirada',
    statusPagamento: 'Pago',
    dataEntrega: '2024-08-25',
    observacao: 'Entrega às 14h'
  }
];

const Dashboard = () => {
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');

  const { data: options = [] } = useOptions();

  // Get unique products for filter
  const produtos = options.filter(opt => opt.category === 'Produto');
  const statusPagamentos = options.filter(opt => opt.category === 'Status Pagamento');

  // Filter orders based on selected filters
  const filteredOrders = mockOrders.filter(order => {
    if (productFilter !== 'all' && order.produto !== productFilter) return false;
    if (statusFilter !== 'all' && order.statusPagamento !== statusFilter) return false;
    
    if (dateFilter !== 'all') {
      const orderDate = new Date(order.dataEntrega);
      const today = new Date();
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      
      if (dateFilter === 'week' && orderDate.getTime() - today.getTime() > oneWeek) return false;
      if (dateFilter === 'month' && orderDate.getMonth() !== today.getMonth()) return false;
    }
    
    return true;
  });

  // Calculate summary stats
  const totalOrders = filteredOrders.length;
  const totalQuantity = filteredOrders.reduce((sum, order) => sum + order.quantidade, 0);
  const paidOrders = filteredOrders.filter(order => order.statusPagamento === 'Pago').length;
  const pendingOrders = totalOrders - paidOrders;

  // Get row color based on delivery date
  const getRowColor = (dataEntrega: string) => {
    const orderDate = new Date(dataEntrega);
    const today = new Date();
    const diffDays = Math.ceil((orderDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return 'bg-green-50 dark:bg-green-950'; // Esta semana - verde
    if (diffDays <= 14) return 'bg-yellow-50 dark:bg-yellow-950'; // Próxima semana - amarelo  
    return 'bg-gray-50 dark:bg-gray-950'; // Mais tarde - cinza
  };

  const exportToCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Produto,Recheio,Quantidade,Entrega,Status Pagamento,Data Entrega,Observação\n"
      + filteredOrders.map(order => 
          `${order.id},${order.produto},${order.recheio},${order.quantidade},${order.entrega},${order.statusPagamento},${order.dataEntrega},"${order.observacao}"`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "pedidos-thai-doces.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-sweet p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Dashboard Thai Doces
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus pedidos de forma eficiente
            </p>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              Novo Pedido
            </Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Pedidos
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalOrders}</div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Quantidade Total
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{totalQuantity}</div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pedidos Pagos
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{paidOrders}</div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pedidos Pendentes
              </CardTitle>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingOrders}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-foreground">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por data" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as datas</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mês</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {statusPagamentos.map((status) => (
                    <SelectItem key={status.id} value={status.value}>
                      {status.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={productFilter} onValueChange={setProductFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Produto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os produtos</SelectItem>
                  {produtos.map((produto) => (
                    <SelectItem key={produto.id} value={produto.value}>
                      {produto.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={exportToCSV} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-foreground">Lista de Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Recheio</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Entrega</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data Entrega</TableHead>
                    <TableHead>Observação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className={getRowColor(order.dataEntrega)}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.produto}</TableCell>
                      <TableCell>{order.recheio}</TableCell>
                      <TableCell>{order.quantidade}</TableCell>
                      <TableCell>{order.entrega}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.statusPagamento === 'Pago' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        }`}>
                          {order.statusPagamento}
                        </span>
                      </TableCell>
                      <TableCell>{order.dataEntrega}</TableCell>
                      <TableCell className="max-w-32 truncate">{order.observacao}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;