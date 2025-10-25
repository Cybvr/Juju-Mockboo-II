'use client';

import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  LogOut, 
  User, 
  CreditCard,
  HelpCircle,
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import { userService } from '@/services/userService';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

interface UserData {
  name: string;
  email: string;
  photoURL: string;
  role?: string;
}

export function ProfileDropdown() {
  const [user, loading] = useAuthState(auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setUserData(null);
        return;
      }

      try {
        // Try to get user data from Firestore first
        const firestoreUser = await userService.getUserById(user.uid);

        if (firestoreUser) {
          setUserData({
            name: firestoreUser.name || user.displayName || 'User',
            email: firestoreUser.email || user.email || '',
            photoURL: firestoreUser.photoURL || user.photoURL || '',
            role: firestoreUser.role
          });
        } else {
          // Fallback to Firebase Auth data
          setUserData({
            name: user.displayName || 'User',
            email: user.email || '',
            photoURL: user.photoURL || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Fallback to Firebase Auth data on error
        setUserData({
          name: user.displayName || 'User',
          email: user.email || '',
          photoURL: user.photoURL || ''
        });
      }
    };

    if (!loading) {
      fetchUserData();
    }
  }, [user, loading]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Error signing out');
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Don't render if no user or still loading
  if (loading || !user || !userData) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={userData.photoURL} alt={userData.name} />
            <AvatarFallback>{getInitials(userData.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userData.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userData.email}
            </p>
            {userData.role === 'admin' && (
              <p className="text-xs text-blue-600 font-medium">Administrator</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/dashboard/account')}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? (
            <Sun className="mr-2 h-4 w-4" />
          ) : (
            <Moon className="mr-2 h-4 w-4" />
          )}
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}