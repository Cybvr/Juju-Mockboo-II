'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthState } from 'react-firebase-hooks/auth'
import { signOut, deleteUser } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { DashboardHeader } from '@/app/common/dashboard/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import {
  LogOut,
  User,
  CreditCard,
  Bell,
  Trash2,
  Settings,
  Crown,
  Calendar,
  Shield,
  Save,
  Edit3
} from 'lucide-react'
import { userService } from '@/services/userService'
import { CreditDisplay } from '@/components/CreditDisplay'
import { PricingTable } from '@/components/PricingTable'
import { PRICING_TIERS, type PricingTier } from '@/data/pricing'
import { toast } from 'sonner'

interface UserData {
  name: string
  email: string
  photoURL: string
  role?: string
  bio?: string
  subscriptionType?: PricingTier
  createdAt?: Date
  updatedAt?: Date
}

export default function AccountPage() {
  const router = useRouter()
  const [user, loading] = useAuthState(auth)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isEditingBio, setIsEditingBio] = useState(false)
  const [tempBio, setTempBio] = useState('')
  const [showPricingTable, setShowPricingTable] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
      return
    }

    const fetchUserData = async () => {
      if (!user) return
      try {
        const firestoreUser = await userService.getUserById(user.uid)
        if (firestoreUser) {
          const userData = {
            name: firestoreUser.name || user.displayName || 'User',
            email: firestoreUser.email || user.email || '',
            photoURL: firestoreUser.photoURL || user.photoURL || '',
            role: firestoreUser.role,
            bio: firestoreUser.bio,
            subscriptionType: (firestoreUser.subscriptionType as PricingTier) || 'free',
            createdAt: firestoreUser.createdAt,
            updatedAt: firestoreUser.updatedAt
          }
          setUserData(userData)
          setTempBio(userData.bio || '')
        } else {
          const fallbackData = {
            name: user.displayName || 'User',
            email: user.email || '',
            photoURL: user.photoURL || '',
            subscriptionType: 'free' as PricingTier,
            createdAt: user.metadata.creationTime ? new Date(user.metadata.creationTime) : undefined
          }
          setUserData(fallbackData)
          setTempBio('')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    if (!loading && user) {
      fetchUserData()
    }
  }, [user, loading, router])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut(auth)
      toast.success('Signed out successfully')
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Error signing out')
    } finally {
      setIsSigningOut(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return

    try {
      // First delete user data from Firestore
      await userService.deleteUser(user.uid)

      // Then delete the Firebase Auth user
      await deleteUser(user)

      toast.success('Account deleted successfully')
      router.push('/')
    } catch (error) {
      console.error('Delete account error:', error)
      toast.error('Error deleting account. Please try again.')
    }
  }

  const handleSaveBio = async () => {
    if (!user) return

    try {
      await userService.updateUser(user.uid, { bio: tempBio })
      setUserData(prev => prev ? { ...prev, bio: tempBio } : null)
      setIsEditingBio(false)
      toast.success('Bio updated successfully')
    } catch (error) {
      console.error('Error updating bio:', error)
      toast.error('Failed to update bio')
    }
  }

  const handleSelectPlan = (tier: PricingTier) => {
    toast.success(`Selected ${tier} plan! Redirecting to checkout...`)
    // Here you would integrate with your payment processor
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (date: Date | any | undefined) => {
    if (!date) return 'Unknown'

    if (date && typeof date.toDate === 'function') {
      return date.toDate().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    if (date instanceof Date) {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    return 'Unknown'
  }

  if (loading || !user || !userData) {
    return (
      <div className="min-h-screen">
        <DashboardHeader />
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <DashboardHeader />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Account Settings</h1>
              <p className="text-muted-foreground">Manage your profile, subscription, and preferences</p>
            </div>
          </div>

          {/* Profile & Bio Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={userData.photoURL} alt={userData.name} />
                  <AvatarFallback className="text-lg">
                    {getInitials(userData.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold">{userData.name}</h2>
                    {userData.role && (
                      <Badge variant={userData.role === 'admin' ? 'default' : 'secondary'}>
                        <Shield className="h-3 w-3 mr-1" />
                        {userData.role}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">{userData.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Member since {formatDate(userData.createdAt)}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bio" className="text-base font-medium">Bio</Label>
                  {!isEditingBio && (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingBio(true)}>
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>

                {isEditingBio ? (
                  <div className="space-y-3">
                    <Textarea
                      value={tempBio}
                      onChange={(e) => setTempBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="min-h-20"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveBio}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        setIsEditingBio(false)
                        setTempBio(userData.bio || '')
                      }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground min-h-5">
                    {userData.bio || 'No bio added yet. Click edit to add one.'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Subscription Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Subscription Details
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowPricingTable(!showPricingTable)}>
                  {showPricingTable ? 'Hide Plans' : 'View Plans'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={userData.subscriptionType === 'free' ? 'secondary' : 'default'}>
                      {PRICING_TIERS[userData.subscriptionType || 'free'].name}
                    </Badge>
                    {userData.subscriptionType !== 'free' && (
                      <span className="text-sm text-muted-foreground">
                        ${PRICING_TIERS[userData.subscriptionType || 'free'].price.monthly}/month
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {PRICING_TIERS[userData.subscriptionType || 'free'].generations} generations per month
                  </p>
                </div>
              </div>

              {showPricingTable && (
                <div className="pt-4">
                  <PricingTable
                    currentTier={userData.subscriptionType || 'free'}
                    onSelectPlan={handleSelectPlan}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Credits Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Credits & Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CreditDisplay />
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive updates about your account and generations</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified when your generations are complete</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="marketing-notifications">Marketing Updates</Label>
                  <p className="text-sm text-muted-foreground">Receive news about new features and promotions</p>
                </div>
                <Switch
                  id="marketing-notifications"
                  checked={notifications.marketing}
                  onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, marketing: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Account</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account,
                      all your created content, and remove all associated data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          {/* Sign Out */}
          <div>
            <div className="pt-6">
              <Button
                variant="outline"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full sm:w-auto"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {isSigningOut ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}