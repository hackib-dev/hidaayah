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
import { updateReflectProfile } from '@/app/(app)/dashboard/profile/queries';
import { fetchVerseReciters } from '@/app/(app)/dashboard/quran/queries';
import { useReciterPreference } from '@/components/reciter-preference-provider';
import type { ReflectProfile } from '@/app/(app)/dashboard/profile/types';
import type { Reciter } from '@/app/(app)/dashboard/quran/types';
import { BadgeCheck, MapPin, Calendar, User, CheckCircle, Mic, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProfileTabPage({ params: _params }: { params: Promise<{ tab: string }> }) {
  const { user, logout, reflectProfile: ctxProfile, reflectProfileLoading } = useAuth();
  const { defaultReciterId, setDefaultReciterId } = useReciterPreference();
  const router = useRouter();

  const [profile, setProfile] = useState<ReflectProfile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('');
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [showReciterDropdown, setShowReciterDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Load reciters
  useEffect(() => {
    fetchVerseReciters()
      .then((res: { reciters: Reciter[] }) => setReciters(res.reciters ?? []))
      .catch(() => null);
  }, []);

  // Seed form from cached context profile — no extra API call
  useEffect(() => {
    if (!ctxProfile) return;
    setProfile(ctxProfile);
    setFirstName(ctxProfile.firstName || '');
    setLastName(ctxProfile.lastName || '');
    setBio(ctxProfile.bio || '');
    setCountry(ctxProfile.country || '');
  }, [ctxProfile]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    // Optimistic update
    setProfile((prev) => (prev ? { ...prev, firstName, lastName, bio, country } : prev));

    try {
      const updated = await updateReflectProfile({ firstName, lastName, bio, country });
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              firstName: prev.firstName,
              lastName: prev.lastName,
              bio: prev.bio,
              country: prev.country
            }
          : prev
      );
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile
    ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() ||
      profile.username ||
      user!.name
    : user!.name;

  return (
    <main className="min-h-screen pb-20 md:pb-8">
      <Navigation />
      <div className="pt-16 md:pt-20 px-4 md:px-6">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 py-6"
          >
            {/* Profile preview card */}
            <Card>
              <CardContent className="pt-5">
                {reflectProfileLoading ? (
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-secondary animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-secondary rounded animate-pulse w-1/2" />
                      <div className="h-3 bg-secondary rounded animate-pulse w-1/3" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    {profile?.avatarUrls?.medium ? (
                      <img
                        src={profile.avatarUrls.medium}
                        alt="avatar"
                        className="w-16 h-16 rounded-2xl object-cover shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-serif font-bold shadow-sm">
                        {displayName[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-foreground text-base">{displayName}</p>
                        {profile?.verified && (
                          <BadgeCheck className="w-4 h-4 text-primary shrink-0" />
                        )}
                      </div>
                      {profile?.username && (
                        <p className="text-xs text-primary font-semibold">@{profile.username}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                        {profile?.country && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {profile.country}
                          </span>
                        )}
                        {profile?.joiningYear && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Joined {profile.joiningYear}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {profile?.bio && !reflectProfileLoading && (
                  <p className="text-sm text-foreground/70 mt-3 leading-relaxed">{profile.bio}</p>
                )}
              </CardContent>
            </Card>

            {/* Edit form */}
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {reflectProfileLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-10 bg-secondary rounded-lg animate-pulse" />
                    ))}
                  </div>
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
                        placeholder="e.g. NG"
                      />
                    </div>

                    {/* Default Reciter Selection */}
                    <div className="space-y-2">
                      <Label>Default Reciter</Label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowReciterDropdown(!showReciterDropdown)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground hover:bg-secondary transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Mic className="w-4 h-4 text-muted-foreground" />
                            <span>
                              {reciters.find((r) => r.id === defaultReciterId)?.name ||
                                'Loading...'}
                            </span>
                          </div>
                          <ChevronDown
                            className={cn(
                              'w-4 h-4 text-muted-foreground transition-transform',
                              showReciterDropdown && 'rotate-180'
                            )}
                          />
                        </button>

                        {showReciterDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg border border-border bg-background shadow-lg z-10">
                            {reciters.map((reciter) => (
                              <button
                                key={reciter.id}
                                type="button"
                                onClick={() => {
                                  setDefaultReciterId(reciter.id);
                                  setShowReciterDropdown(false);
                                }}
                                className={cn(
                                  'w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-secondary',
                                  reciter.id === defaultReciterId
                                    ? 'bg-primary/10 text-primary font-semibold'
                                    : 'text-foreground'
                                )}
                              >
                                {reciter.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        This reciter will be used by default when playing Quran audio
                      </p>
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    {saved && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        Profile saved successfully
                      </div>
                    )}
                    <Button onClick={handleSave} className="w-full" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-destructive text-base">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  variant="destructive"
                  onClick={() => {
                    logout();
                    router.replace('/');
                  }}
                  className="w-full"
                >
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
