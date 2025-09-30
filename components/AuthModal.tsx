'use client';

import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import { FcGoogle } from 'react-icons/fc';
import { userService } from '@/services/userService';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

export default function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user already exists in Firestore
      const existingUser = await userService.getUserById(user.uid);

      if (!existingUser) {
        // Create new user document
        const newUser = {
          id: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
          role: 'user', // Default role
          emailVerified: user.emailVerified,
          isPublic: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await userService.createUser(newUser);
        console.log('New user created in Firestore');
      } else {
        // Update existing user's last login
        await userService.updateUser(user.uid, {
          updatedAt: new Date(),
          photoURL: user.photoURL || existingUser.photoURL,
          name: user.displayName || existingUser.name
        });
        console.log('Existing user updated');
      }

      toast.success(`Welcome, ${user.displayName || 'there'}!`);
      onOpenChange(false);
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Google Sign-In error:', error);

      let errorMessage = 'An error occurred during sign-in. Please try again.';

      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-in was cancelled. Please try again.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Pop-up was blocked. Please allow pop-ups and try again.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many requests. Please wait a moment and try again.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="rounded-2xl overflow-hidden w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <Image
              src="/images/juju.png"
              alt="Juju Logo"
              width={96}
              height={96}
              className="object-contain"
              style={{ width: 'auto', height: 'auto' }}
            />
          </div>
          <DialogTitle className="text-2xl font-bold">Welcome</DialogTitle>
          <DialogDescription>
            Sign in with your Google account to access the Workspace Suite and start generating images
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <Button 
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-12 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center justify-center space-x-3"
            variant="outline"
          >
            <FcGoogle className="w-5 h-5" />
            <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              By signing in, you agree to our{' '}
              <Button variant="link" className="text-xs p-0 h-auto">
                Terms of Service
              </Button>{' '}
              and{' '}
              <Button variant="link" className="text-xs p-0 h-auto">
                Privacy Policy
              </Button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}