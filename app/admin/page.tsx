'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { documentService } from '@/services/documentService';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Users,
  FileText,
  Layout,
  TrendingUp,
  Activity
} from 'lucide-react';

// Dashboard Overview Page
export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: { total: 0, verified: 0, admins: 0 },
    documents: { total: 0, public: 0, private: 0 },
  });
  const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch real documents data
        const allDocuments = await documentService.getAllDocumentsForAdmin();
        const publicDocuments = allDocuments.filter(doc => doc.isPublic);
        const privateDocuments = allDocuments.filter(doc => !doc.isPublic);

        // Fetch recent documents
        const recent = await documentService.getRecentDocuments(5);
        setRecentDocuments(recent);

        // Update stats with real data
        setStats({
          users: { total: 0, verified: 0, admins: 0 }, // TODO: Implement user service
          documents: {
            total: allDocuments.length,
            public: publicDocuments.length,
            private: privateDocuments.length
          }
        });
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const StatCard = ({ title, icon: Icon, stats, color = "blue" }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}-600`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.total}</div>
        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
          {Object.entries(stats).map(([key, value]) => {
            if (key === 'total') return null;
            return (
              <span key={key} className="capitalize">
                {key}: {value as number}
              </span>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );

  const QuickActions = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button className="w-full justify-start" variant="outline">
          <Users className="h-4 w-4 mr-2" />
          Add New User
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <Layout className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </CardContent>
    </Card>
  );

  const RecentActivity = () => (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Recent Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-3 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : recentDocuments.length > 0 ? (
          <div className="space-y-3">
            {recentDocuments.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <FileText className={`h-4 w-4 ${
                    doc.type === 'image' ? 'text-blue-600' :
                    doc.type === 'template' ? 'text-purple-600' : 'text-green-600'
                  }`} />
                  <span className="text-sm truncate max-w-64">{doc.title}</span>
                  {doc.isPublic && <Badge variant="secondary" className="text-xs">Public</Badge>}
                </div>
                <span className="text-xs text-muted-foreground">
                  {doc.updatedAt?.toDate ? doc.updatedAt.toDate().toLocaleDateString() : 'Recently'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            No recent documents found
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your admin portal</p>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Users"
          icon={Users}
          stats={stats.users}
          color="blue"
        />
        <StatCard
          title="Documents"
          icon={FileText}
          stats={stats.documents}
          color="green"
        />
      </div>
      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickActions />
        <RecentActivity />
      </div>
    </div>
  );
}
