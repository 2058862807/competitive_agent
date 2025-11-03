import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getSales, createSale, getCustomers } from '@/api';
import { Plus, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    customer_name: '',
    product: '',
    amount: '',
    status: 'completed'
  });

  useEffect(() => {
    loadSales();
    loadCustomers();
  }, []);

  const loadSales = async () => {
    try {
      const response = await getSales();
      setSales(response.data);
    } catch (error) {
      toast.error('Failed to load sales');
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await getCustomers();
      setCustomers(response.data);
    } catch (error) {
      toast.error('Failed to load customers');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSale({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      toast.success('Sale created successfully');
      setDialogOpen(false);
      setFormData({ customer_id: '', customer_name: '', product: '', amount: '', status: 'completed' });
      loadSales();
    } catch (error) {
      toast.error('Failed to create sale');
    }
  };

  const handleCustomerSelect = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    setFormData({
      ...formData,
      customer_id: customerId,
      customer_name: customer ? customer.name : ''
    });
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" data-testid="sales-title">Sales</h1>
          <p className="text-gray-500 mt-1">Track and manage all sales transactions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg" data-testid="add-sale-btn">
              <Plus className="w-4 h-4 mr-2" /> Add Sale
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Sale</DialogTitle>
              <DialogDescription>Record a new sale transaction</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="customer">Customer *</Label>
                  <Select onValueChange={handleCustomerSelect} required>
                    <SelectTrigger data-testid="sale-customer-select">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="product">Product/Service *</Label>
                  <Input
                    id="product"
                    value={formData.product}
                    onChange={(e) => setFormData({...formData, product: e.target.value})}
                    required
                    data-testid="sale-product-input"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required
                    data-testid="sale-amount-input"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" data-testid="save-sale-btn">Create Sale</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sales</CardTitle>
          <CardDescription>Complete history of sales transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id} data-testid={`sale-row-${sale.id}`}>
                  <TableCell className="font-medium">{sale.customer_name}</TableCell>
                  <TableCell>{sale.product}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1 text-green-600 font-semibold">
                      <DollarSign className="w-4 h-4" />
                      <span>{sale.amount.toFixed(2)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={sale.status === 'completed' ? 'default' : 'secondary'}>
                      {sale.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(sale.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {sales.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p>No sales recorded yet. Add your first sale above!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
