'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { Navigation } from '@/components/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { fetchReflectProfile, updateReflectProfile } from '@/app/profile/queries';

export default function ProfileTabPage({ params: _params }: { params: Promise<{ tab: string }> }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('');
  const [saving, setSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchReflectProfile()
      .then((profile) => {
        setFirstName(profile.firstName || '');
        setLastName(profile.lastName || '');
        setBio(profile.bio || '');
        setCountry(profile.country || '');
      })
      .catch(() => {
        // Fall back to auth user name if profile fetch fails
        const parts = user.name?.split(' ') ?? [];
        setFirstName(parts[0] || '');
        setLastName(parts.slice(1).join(' ') || '');
      })
      .finally(() => setProfileLoading(false));
  }, [user]);

  if (loading || !user) {
    return <div>Loading...</div>;
  }

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateReflectProfile({ firstName, lastName, bio, country });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save profile';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  return (
    <main className="min-h-screen pb-20 md:pb-8">
      <Navigation />
      <div className="pt-16 md:pt-20 px-4 md:px-6">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileLoading ? (
                  <p className="text-sm text-muted-foreground">Loading profile…</p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Input
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="e.g. US"
                      />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button onClick={handleSave} className="w-full" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={handleLogout} className="w-full">
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
