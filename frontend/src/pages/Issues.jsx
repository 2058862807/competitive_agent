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
import { getIssues, createIssue, updateIssue, getCustomers } from '@/api';
import { Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    customer_id: '',
    customer_name: '',
    priority: 'medium'
  });

  useEffect(() => {
    loadIssues();
    loadCustomers();
  }, []);

  const loadIssues = async () => {
    try {
      const response = await getIssues();
      setIssues(response.data);
    } catch (error) {
      toast.error('Failed to load issues');
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
      await createIssue(formData);
      toast.success('Issue created successfully');
      setDialogOpen(false);
      setFormData({ title: '', description: '', customer_id: '', customer_name: '', priority: 'medium' });
      loadIssues();
    } catch (error) {
      toast.error('Failed to create issue');
    }
  };

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      await updateIssue(issueId, { status: newStatus });
      toast.success('Issue status updated');
      loadIssues();
    } catch (error) {
      toast.error('Failed to update issue');
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" data-testid="issues-title">Issues</h1>
          <p className="text-gray-500 mt-1">Track and resolve customer issues</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg" data-testid="add-issue-btn">
              <Plus className="w-4 h-4 mr-2" /> Report Issue
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report New Issue</DialogTitle>
              <DialogDescription>Create a new issue ticket</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    data-testid="issue-title-input"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                    data-testid="issue-description-input"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="customer">Customer (Optional)</Label>
                  <Select onValueChange={handleCustomerSelect}>
                    <SelectTrigger data-testid="issue-customer-select">
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
                  <Label htmlFor="priority">Priority *</Label>
                  <Select onValueChange={(value) => setFormData({...formData, priority: value})} defaultValue="medium">
                    <SelectTrigger data-testid="issue-priority-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" data-testid="save-issue-btn">Create Issue</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Issues</CardTitle>
          <CardDescription>Manage and track issue resolution</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {issues.map((issue) => (
                <TableRow key={issue.id} data-testid={`issue-row-${issue.id}`}>
                  <TableCell className="font-medium max-w-xs">
                    <div>
                      <div className="font-semibold">{issue.title}</div>
                      <div className="text-sm text-gray-500 truncate">{issue.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>{issue.customer_name || '-'}</TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(issue.priority)}>
                      {issue.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(issue.status)}>
                      {issue.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(issue.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Select onValueChange={(value) => handleStatusChange(issue.id, value)} defaultValue={issue.status}>
                      <SelectTrigger className="w-32" data-testid={`issue-status-select-${issue.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {issues.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No issues reported yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
