"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from "../components/DashboardHeader";
import SideNavigation from "../components/SideNavigation";

export default function NotificationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return;
    const u = JSON.parse(savedUser);
    setUser(u);
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const res = await fetch(`/api/notifications?email=${encodeURIComponent(user.email)}`);
        const data = await res.json();
        if (res.ok) setItems(data.notifications);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <SideNavigation user={user || undefined} isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <div className="flex-1">
      <DashboardHeader user={user || undefined} onToggleNav={() => setIsNavOpen(true)} />
      <div className="max-w-3xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            ← Back to Dashboard
          </button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-gray-600">No notifications yet.</div>
        ) : (
          <div className="space-y-3">
            {items.map((n) => (
              <div key={n.id} className={`p-4 rounded border ${n.read ? 'bg-white' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-gray-900">{n.title}</div>
                    <div className="text-gray-700">{n.message}</div>
                    <div className="text-xs text-gray-500 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  {!n.read && (
                    <button
                      disabled={!!updating}
                      onClick={async () => {
                        setUpdating(n.id);
                        const res = await fetch('/api/notifications', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: n.id, userEmail: user.email })
                        });
                        if (res.ok) {
                          setItems(prev => prev.map(it => it.id === n.id ? { ...it, read: true } : it));
                        }
                        setUpdating(null);
                      }}
                      className="ml-4 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}


