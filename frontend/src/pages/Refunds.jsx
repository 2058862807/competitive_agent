import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getRefunds, createRefund, updateRefund, getSales, getCustomers } from '@/api';
import { Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function Refunds() {
  const [refunds, setRefunds] = useState([]);
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    sale_id: '',
    customer_id: '',
    customer_name: '',
    amount: '',
    reason: ''
  });

  useEffect(() => {
    loadRefunds();
    loadSales();
    loadCustomers();
  }, []);

  const loadRefunds = async () => {
    try {
      const response = await getRefunds();
      setRefunds(response.data);
    } catch (error) {
      toast.error('Failed to load refunds');
    }
  };

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
      await createRefund({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      toast.success('Refund request created successfully');
      setDialogOpen(false);
      setFormData({ sale_id: '', customer_id: '', customer_name: '', amount: '', reason: '' });
      loadRefunds();
    } catch (error) {
      toast.error('Failed to create refund');
    }
  };

  const handleStatusChange = async (refundId, newStatus) => {
    try {
      await updateRefund(refundId, { status: newStatus });
      toast.success('Refund status updated');
      loadRefunds();
    } catch (error) {
      toast.error('Failed to update refund status');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" data-testid="refunds-title">Refunds</h1>
          <p className="text-gray-500 mt-1">Manage refund requests and processing</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg" data-testid="add-refund-btn">
              <Plus className="w-4 h-4 mr-2" /> Request Refund
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Refund</DialogTitle>
              <DialogDescription>Create a new refund request</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="customer">Customer *</Label>
                  <Select onValueChange={handleCustomerSelect} required>
                    <SelectTrigger data-testid="refund-customer-select">
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
                  <Label htmlFor="sale_id">Sale ID *</Label>
                  <Input
                    id="sale_id"
                    value={formData.sale_id}
                    onChange={(e) => setFormData({...formData, sale_id: e.target.value})}
                    required
                    data-testid="refund-sale-id-input"
                    placeholder="Enter sale ID"
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
                    data-testid="refund-amount-input"
                  />
                </div>
                <div>
                  <Label htmlFor="reason">Reason *</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    required
                    data-testid="refund-reason-input"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" data-testid="save-refund-btn">Submit Request</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Refunds</CardTitle>
          <CardDescription>Track and manage refund requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refunds.map((refund) => (
                <TableRow key={refund.id} data-testid={`refund-row-${refund.id}`}>
                  <TableCell className="font-medium">{refund.customer_name}</TableCell>
                  <TableCell className="text-red-600 font-semibold">${refund.amount.toFixed(2)}</TableCell>
                  <TableCell className="max-w-xs truncate">{refund.reason}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(refund.status)}>
                      {refund.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(refund.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {refund.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(refund.id, 'approved')}
                          data-testid={`approve-refund-${refund.id}`}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(refund.id, 'rejected')}
                          data-testid={`reject-refund-${refund.id}`}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                    {refund.status === 'approved' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(refund.id, 'completed')}
                        data-testid={`complete-refund-${refund.id}`}
                      >
                        Complete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {refunds.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <RefreshCw className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No refund requests yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
