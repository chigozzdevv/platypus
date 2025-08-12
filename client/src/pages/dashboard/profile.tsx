import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Save, Camera } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { authService } from '@/services/auth';
import Button from '@/components/button';

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    specialties: user?.specialties || [],
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedUser = await authService.updateProfile(formData);
      setUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      bio: user?.bio || '',
      avatar: user?.avatar || '',
      specialties: user?.specialties || [],
    });
    setIsEditing(false);
  };

  const addSpecialty = (specialty: string) => {
    if (specialty && !formData.specialties.includes(specialty)) {
      setFormData({
        ...formData,
        specialties: [...formData.specialties, specialty]
      });
    }
  };

  const removeSpecialty = (specialty: string) => {
    setFormData({
      ...formData,
      specialties: formData.specialties.filter(s => s !== specialty)
    });
  };

  const availableSpecialties = [
    'Scalping', 'Swing Trading', 'Day Trading', 'Technical Analysis',
    'Fundamental Analysis', 'Risk Management', 'Algorithmic Trading',
    'Crypto', 'Forex', 'Stocks', 'Futures', 'Options'
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Profile</h1>
          <p className="text-neutral-600">Manage your trading profile and preferences</p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-neutral-200 rounded-full flex items-center justify-center">
                {formData.avatar ? (
                  <img 
                    src={formData.avatar} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-neutral-600" />
                )}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 bg-neutral-900 text-white rounded-full p-2 hover:bg-neutral-800 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-neutral-900">{user?.username}</h2>
              <p className="text-neutral-500">Reputation: {user?.reputation}/100</p>
              <p className="text-sm text-neutral-400 mt-1">
                Wallet: {user?.walletAddress ? 
                  `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : 
                  'Not connected'
                }
              </p>
            </div>

            <div>
              {!isEditing ? (
                <Button
                  variant="secondary"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </div>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Profile Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 disabled:bg-neutral-50 disabled:text-neutral-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
                rows={4}
                className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 disabled:bg-neutral-50 disabled:text-neutral-500"
                placeholder="Tell others about your trading experience and expertise..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Avatar URL
              </label>
              <input
                type="url"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500 disabled:bg-neutral-50 disabled:text-neutral-500"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Trading Specialties
              </label>
              
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  {formData.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {specialty}
                      {isEditing && (
                        <button
                          onClick={() => removeSpecialty(specialty)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {isEditing && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableSpecialties
                    .filter(specialty => !formData.specialties.includes(specialty))
                    .map((specialty) => (
                    <button
                      key={specialty}
                      onClick={() => addSpecialty(specialty)}
                      className="text-left px-3 py-2 text-sm border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors"
                    >
                      + {specialty}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}