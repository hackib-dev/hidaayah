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
import type { ReflectProfile } from '@/app/(app)/dashboard/profile/types';
import { BadgeCheck, MapPin, Calendar, User, CheckCircle } from 'lucide-react';

const COUNTRIES: { code: string; name: string }[] = [
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AL', name: 'Albania' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'AO', name: 'Angola' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BR', name: 'Brazil' },
  { code: 'BN', name: 'Brunei' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CA', name: 'Canada' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'TD', name: 'Chad' },
  { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' },
  { code: 'KM', name: 'Comoros' },
  { code: 'CD', name: 'Congo (DRC)' },
  { code: 'CG', name: 'Congo (Republic)' },
  { code: 'CI', name: "Côte d'Ivoire" },
  { code: 'HR', name: 'Croatia' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'EG', name: 'Egypt' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GM', name: 'Gambia' },
  { code: 'DE', name: 'Germany' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GR', name: 'Greece' },
  { code: 'GN', name: 'Guinea' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Italy' },
  { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LY', name: 'Libya' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MV', name: 'Maldives' },
  { code: 'ML', name: 'Mali' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'MX', name: 'Mexico' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NE', name: 'Niger' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'NO', name: 'Norway' },
  { code: 'OM', name: 'Oman' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PS', name: 'Palestine' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SN', name: 'Senegal' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'SO', name: 'Somalia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'ES', name: 'Spain' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SY', name: 'Syria' },
  { code: 'TJ', name: 'Tajikistan' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TG', name: 'Togo' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'TM', name: 'Turkmenistan' },
  { code: 'UG', name: 'Uganda' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'YE', name: 'Yemen' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' }
].sort((a, b) => a.name.localeCompare(b.name));

export default function ProfileTabPage({ params: _params }: { params: Promise<{ tab: string }> }) {
  const { user, logout, reflectProfile: ctxProfile, reflectProfileLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<ReflectProfile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [country, setCountry] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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
                            {(() => {
                              try {
                                return (
                                  new Intl.DisplayNames(['en'], { type: 'region' }).of(
                                    profile.country
                                  ) ?? profile.country
                                );
                              } catch {
                                return profile.country;
                              }
                            })()}
                          </span>
                        )}
                        {profile?.joiningYear && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Joined {profile.joiningYear}
                          </span>
                        )}
                        {profile?.followersCount !== undefined && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {profile.followersCount} followers
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
                      <select
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option value="">Select a country</option>
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.name}
                          </option>
                        ))}
                      </select>
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
