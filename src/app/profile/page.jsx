'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import AuthGuard from '@/components/AuthGuard';
import Navbar from '@/components/Navbar';
import {
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Globe,
  Edit2,
  Save,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from '@/components/Icons';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [profile, setProfile] = useState({
    id: '',
    full_name: '',
    company_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstin: '',
    website: '',
    tagline: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setErrorMsg('');

      // 1. Get authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not found. Please log in.');

      // 2. Fetch profile from 'profiles' table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Profiles table fetch notice:', error.message);
      }

      // Load from DB or fallback to user metadata
      setProfile({
        id: user.id,
        email: user.email || '',
        full_name: data?.full_name || user.user_metadata?.full_name || '',
        company_name: data?.company_name || user.user_metadata?.company_name || '',
        phone: data?.phone || user.user_metadata?.phone || '',
        address: data?.address || user.user_metadata?.address || '',
        city: data?.city || user.user_metadata?.city || '',
        state: data?.state || user.user_metadata?.state || '',
        pincode: data?.pincode || user.user_metadata?.pincode || '',
        gstin: data?.gstin || user.user_metadata?.gstin || '',
        website: data?.website || user.user_metadata?.website || '',
        tagline: data?.tagline || user.user_metadata?.tagline || '',
      });
    } catch (err) {
      console.error('Error loading profile:', err);
      setErrorMsg(err.message || 'Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User session not found.');

      // 1. Prepare data payload
      const payload = {
        id: user.id,
        full_name: profile.full_name.trim(),
        company_name: profile.company_name.trim(),
        email: user.email,
        phone: profile.phone.trim(),
        address: profile.address.trim(),
        city: profile.city.trim(),
        state: profile.state.trim(),
        pincode: profile.pincode.trim(),
        gstin: profile.gstin.trim(),
        website: profile.website.trim(),
        tagline: profile.tagline.trim(),
        updated_at: new Date().toISOString(),
      };

      // 2. Upsert into Supabase 'profiles' table
      const { error: dbError } = await supabase
        .from('profiles')
        .upsert(payload, { onConflict: 'id' });

      if (dbError) {
        throw new Error(`Supabase Database Error: ${dbError.message}. (Please ensure you have run the schema.sql in your Supabase SQL editor).`);
      }

      // 3. Also sync to user metadata
      await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name.trim(),
          company_name: profile.company_name.trim(),
          phone: profile.phone.trim(),
          address: profile.address.trim(),
          city: profile.city.trim(),
          state: profile.state.trim(),
          pincode: profile.pincode.trim(),
          gstin: profile.gstin.trim(),
          website: profile.website.trim(),
          tagline: profile.tagline.trim(),
        },
      });

      setSuccessMsg('Profile updated and saved to Supabase successfully!');
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      setErrorMsg(err.message || 'Failed to update profile in Supabase.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar showNewButton={true} />

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/quotations"
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Quotations
            </Link>
            {!isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setSuccessMsg('');
                  setErrorMsg('');
                }}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-orange-500 hover:bg-orange-600 shadow-sm transition-colors"
              >
                <Edit2 className="w-4 h-4 mr-1.5" />
                Edit Profile
              </button>
            )}
          </div>

          {/* Status Messages */}
          {successMsg && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 flex items-start space-x-2 text-sm text-green-700">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-2 text-sm text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-xl p-16 border border-brand-border text-center shadow-xs">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-3 text-sm text-gray-500">Loading profile...</p>
            </div>
          ) : isEditing ? (
            /* ================= EDIT MODE ================= */
            <form onSubmit={handleSave} className="space-y-6">
              {/* Header Card */}
              <div className="bg-white p-6 rounded-xl border border-brand-border shadow-xs">
                <h1 className="text-lg font-bold text-gray-900 pb-2 border-b border-gray-100 flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 mr-2"></span>
                  Edit Profile Details
                </h1>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full Name / Contact Person
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Alex Johnson"
                      value={profile.full_name}
                      onChange={(e) =>
                        setProfile({ ...profile, full_name: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Company / Organization Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Apex Software Labs"
                      value={profile.company_name}
                      onChange={(e) =>
                        setProfile({ ...profile, company_name: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Email Address (Account ID)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={profile.email}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={profile.phone}
                      onChange={(e) =>
                        setProfile({ ...profile, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {/* Tagline */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Business Tagline / Subtitle
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bespoke Cloud & Web Solutions"
                      value={profile.tagline}
                      onChange={(e) =>
                        setProfile({ ...profile, tagline: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Business & Tax Details Card */}
              <div className="bg-white p-6 rounded-xl border border-brand-border shadow-xs">
                <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100 flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 mr-2"></span>
                  Tax & Online Presence
                </h2>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* GSTIN */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      GSTIN / Tax ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 29AAAAA0000A1Z5"
                      value={profile.gstin}
                      onChange={(e) =>
                        setProfile({ ...profile, gstin: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 uppercase"
                    />
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Website URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://www.example.com"
                      value={profile.website}
                      onChange={(e) =>
                        setProfile({ ...profile, website: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Address Card */}
              <div className="bg-white p-6 rounded-xl border border-brand-border shadow-xs">
                <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-100 flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500 mr-2"></span>
                  Business Location & Address
                </h2>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Street Address */}
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Street Address / Office Unit
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Suite 402, Tech Park Avenue"
                      value={profile.address}
                      onChange={(e) =>
                        setProfile({ ...profile, address: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bengaluru"
                      value={profile.city}
                      onChange={(e) =>
                        setProfile({ ...profile, city: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Karnataka"
                      value={profile.state}
                      onChange={(e) =>
                        setProfile({ ...profile, state: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Pincode / Postal Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 560001"
                      value={profile.pincode}
                      onChange={(e) =>
                        setProfile({ ...profile, pincode: e.target.value })
                      }
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={saving}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg shadow-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-60 transition-colors"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* ================= VIEW MODE ================= */
            <div className="space-y-6">
              {/* Profile Top Hero Card */}
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-brand-border shadow-xs">
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-5">
                  <div className="w-20 h-20 rounded-2xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 shadow-xs flex-shrink-0">
                    <User className="w-10 h-10" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {profile.full_name || 'Your Name'}
                    </h1>
                    <p className="text-sm font-semibold text-orange-600 mt-0.5">
                      {profile.company_name || 'Your Company Name'}
                    </p>
                    {profile.tagline && (
                      <p className="text-xs text-gray-500 mt-1 italic">
                        "{profile.tagline}"
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-4 justify-center sm:justify-start text-xs text-gray-600">
                      <div className="flex items-center">
                        <Mail className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                        <span>{profile.email}</span>
                      </div>
                      {profile.phone && (
                        <div className="flex items-center">
                          <Phone className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                          <span>{profile.phone}</span>
                        </div>
                      )}
                      {profile.website && (
                        <div className="flex items-center">
                          <Globe className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-orange-600 hover:underline"
                          >
                            {profile.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Business Information Card */}
                <div className="bg-white p-6 rounded-xl border border-brand-border shadow-xs">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100 flex items-center">
                    <Building className="w-4 h-4 text-orange-500 mr-2" />
                    Business & Tax Info
                  </h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <div>
                      <span className="text-xs text-gray-400 block">Company Name</span>
                      <span className="font-semibold text-gray-800">
                        {profile.company_name || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block">GSTIN / Tax ID</span>
                      <span className="font-semibold text-gray-800 uppercase">
                        {profile.gstin || '-'}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 block">Website</span>
                      <span className="text-gray-800">
                        {profile.website ? (
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-orange-600 hover:underline"
                          >
                            {profile.website}
                          </a>
                        ) : (
                          '-'
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location Card */}
                <div className="bg-white p-6 rounded-xl border border-brand-border shadow-xs">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100 flex items-center">
                    <MapPin className="w-4 h-4 text-orange-500 mr-2" />
                    Office Address
                  </h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <div>
                      <span className="text-xs text-gray-400 block">Street Address</span>
                      <span className="font-medium text-gray-800">
                        {profile.address || '-'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-xs text-gray-400 block">City</span>
                        <span className="font-medium text-gray-800">
                          {profile.city || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block">State</span>
                        <span className="font-medium text-gray-800">
                          {profile.state || '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block">Pincode</span>
                        <span className="font-medium text-gray-800">
                          {profile.pincode || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
