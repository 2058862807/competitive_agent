import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboardStats } from '@/api';
import { Users, TrendingUp, AlertTriangle, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 fade-in">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" data-testid="dashboard-title">
            Business Dashboard
          </h1>
          <p className="text-gray-500 mt-1">View the dashboard data. Please try again later.</p>
        </div>
        <button
          onClick={loadStats}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all duration-200"
          data-testid="refresh-dashboard-btn"
        >
          Refresh Data
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Customers */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow" data-testid="total-customers-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center justify-between">
              <span>Total Customers</span>
              <Users className="w-8 h-8 opacity-80" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold" data-testid="total-customers-value">{stats?.total_customers || 0}</div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span data-testid="new-customers-value">{stats?.new_customers_this_month || 0} new this month</span>
            </div>
          </CardContent>
        </Card>

        {/* Pending Refunds */}
        <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow" data-testid="pending-refunds-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center justify-between">
              <span>Pending Refunds</span>
              <AlertTriangle className="w-8 h-8 opacity-80" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold" data-testid="pending-refunds-value">{stats?.pending_refunds || 0}</div>
            <div className="mt-2 flex items-center text-sm">
              <span data-testid="refunds-attention-value">{stats?.refunds_requiring_attention || 0} Requires attention</span>
            </div>
          </CardContent>
        </Card>

        {/* Open Issues */}
        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow" data-testid="open-issues-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center justify-between">
              <span>Open Issues</span>
              <AlertTriangle className="w-8 h-8 opacity-80" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold" data-testid="open-issues-value">{stats?.open_issues || 0}</div>
            <div className="mt-2 flex items-center text-sm">
              <span data-testid="issues-review-value">{stats?.issues_needing_review || 0} Needs review</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend */}
      <Card className="shadow-lg" data-testid="revenue-trend-card">
        <CardHeader>
          <CardTitle>Revenue Trend (Last 30 Days)</CardTitle>
          <CardDescription>Total revenue over the past month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline space-x-2">
            <div className="text-4xl font-bold text-green-600" data-testid="total-revenue-value">
              ${stats?.total_revenue_30_days?.toFixed(2) || '0.00'}
            </div>
            <div className="text-sm text-gray-500">in last 30 days</div>
          </div>
          <div className="mt-4 h-48 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>Chart visualization area</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Product */}
      <Card className="shadow-lg" data-testid="revenue-by-product-card">
        <CardHeader>
          <CardTitle>Revenue by Product</CardTitle>
          <CardDescription>Top performing products in the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.revenue_by_product && stats.revenue_by_product.length > 0 ? (
            <div className="space-y-4">
              {stats.revenue_by_product.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors" data-testid={`product-item-${index}`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900" data-testid={`product-name-${index}`}>{item.product}</div>
                      <div className="text-sm text-gray-500" data-testid={`product-count-${index}`}>{item.count} sales</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600" data-testid={`product-revenue-${index}`}>${item.revenue.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No product revenue data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="shadow-lg" data-testid="recent-activity-card">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recent_activities && stats.recent_activities.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_activities.map((activity, index) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors" data-testid={`activity-item-${index}`}>
                  <div className={`w-2 h-2 mt-2 rounded-full ${
                    activity.type === 'sale' ? 'bg-green-500' :
                    activity.type === 'refund' ? 'bg-red-500' :
                    activity.type === 'issue' ? 'bg-yellow-500' :
                    activity.type === 'customer' ? 'bg-blue-500' :
                    'bg-purple-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-900" data-testid={`activity-description-${index}`}>{activity.description}</p>
                      <Badge variant="outline" className="text-xs" data-testid={`activity-type-${index}`}>
                        {activity.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1" data-testid={`activity-time-${index}`}>
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
