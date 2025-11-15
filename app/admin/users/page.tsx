'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Users
} from 'lucide-react';

// Note: UserService is currently disabled in the codebase
// This is a placeholder until user management is properly implemented

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  isVerified?: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newItem, setNewItem] = useState<any>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Implement real user fetching when UserService is available
    // For now, showing placeholder message
    setUsers([]);
  }, []);

  const handleCreate = () => {
    const id = Date.now().toString();
    const newUser = { ...newItem, id };
    setUsers([...users, newUser]);
    setNewItem({});
  };

  const handleUpdate = (id: string) => {
    setUsers(users.map(user => user.id === id ? editingItem : user));
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Users Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Create Form */}
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-semibold mb-3">Create New User</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Display Name"
              value={newItem.displayName || ''}
              onChange={(e) => setNewItem({...newItem, displayName: e.target.value})}
            />
            <Input
              placeholder="Email"
              value={newItem.email || ''}
              onChange={(e) => setNewItem({...newItem, email: e.target.value})}
            />
            <Input
              placeholder="Role"
              value={newItem.role || ''}
              onChange={(e) => setNewItem({...newItem, role: e.target.value})}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newItem.isVerified || false}
                onChange={(e) => setNewItem({...newItem, isVerified: e.target.checked})}
              />
              <label>Verified</label>
            </div>
          </div>
          <Button onClick={handleCreate} className="mt-3">
            <Plus className="h-4 w-4 mr-2" />
            Create User
          </Button>
        </div>

        {/* Users List */}
        <div className="space-y-3">
          <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">User Management Coming Soon</h3>
            <p className="text-muted-foreground mb-4">
              The UserService is currently being restructured. User management tools will be available soon.
            </p>
            <div className="text-sm text-muted-foreground">
              <p>• User authentication via Firebase Auth</p>
              <p>• Role-based access control</p>
              <p>• User verification system</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}