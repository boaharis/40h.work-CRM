'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Lead, Invoice, Quote, Job } from '@/types';

export default function DashboardPage() {
  const { user, claims } = useAuth();
  const [metrics, setMetrics] = useState({
    monthlyRevenue: 0,
    revenueChange: 0,
    activeLeads: 0,
    leadsChange: 0,
    closingRate: 0,
    closingRateChange: 0,
    activeJobs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !claims?.tenantId) return;

    const tenantId = claims.tenantId;

    // Calculate date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Real-time subscription to invoices
    const invoicesQuery = query(
      collection(db, `tenants/${tenantId}/invoices`),
      where('status', 'in', ['paid', 'sent'])
    );

    const unsubscribeInvoices = onSnapshot(invoicesQuery, (snapshot) => {
      let thisMonthRevenue = 0;
      let lastMonthRevenue = 0;

      snapshot.docs.forEach((doc) => {
        const invoice = doc.data() as Invoice;
        const paidDate = invoice.paidAt?.toDate() || invoice.createdAt?.toDate();

        if (paidDate && invoice.status === 'paid') {
          if (paidDate >= startOfMonth) {
            thisMonthRevenue += invoice.total;
          } else if (paidDate >= startOfLastMonth && paidDate <= endOfLastMonth) {
            lastMonthRevenue += invoice.total;
          }
        }
      });

      const revenueChange = lastMonthRevenue > 0
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

      setMetrics((prev) => ({
        ...prev,
        monthlyRevenue: thisMonthRevenue,
        revenueChange,
      }));
    });

    // Real-time subscription to leads
    const leadsQuery = query(
      collection(db, `tenants/${tenantId}/leads`),
      where('status', 'not-in', ['won', 'lost'])
    );

    const unsubscribeLeads = onSnapshot(leadsQuery, (snapshot) => {
      setMetrics((prev) => ({
        ...prev,
        activeLeads: snapshot.size,
      }));
    });

    // Real-time subscription to jobs
    const jobsQuery = query(
      collection(db, `tenants/${tenantId}/jobs`),
      where('status', 'in', ['scheduled', 'in_progress'])
    );

    const unsubscribeJobs = onSnapshot(jobsQuery, (snapshot) => {
      setMetrics((prev) => ({
        ...prev,
        activeJobs: snapshot.size,
      }));
    });

    setLoading(false);

    return () => {
      unsubscribeInvoices();
      unsubscribeLeads();
      unsubscribeJobs();
    };
  }, [user, claims]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600 mt-1">Welcome back, {user?.displayName}!</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Monthly Revenue"
          value={`$${metrics.monthlyRevenue.toLocaleString()}`}
          change={metrics.revenueChange}
          icon="💰"
        />
        <MetricCard
          title="Active Leads"
          value={metrics.activeLeads.toString()}
          change={metrics.leadsChange}
          icon="🎯"
        />
        <MetricCard
          title="Closing Rate"
          value={`${metrics.closingRate.toFixed(1)}%`}
          change={metrics.closingRateChange}
          icon="📊"
        />
        <MetricCard
          title="Active Jobs"
          value={metrics.activeJobs.toString()}
          change={0}
          icon="🚚"
        />
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton icon="👤" label="Add Customer" href="/dashboard/customers/new" />
          <QuickActionButton icon="🎯" label="Create Lead" href="/dashboard/leads/new" />
          <QuickActionButton icon="💰" label="New Quote" href="/dashboard/quotes/new" />
          <QuickActionButton icon="🚚" label="Schedule Job" href="/dashboard/jobs/new" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <ActivityItem
            icon="📧"
            title="New lead from website"
            description="John Doe - Moving service inquiry"
            time="5 minutes ago"
          />
          <ActivityItem
            icon="💰"
            title="Quote accepted"
            description="Quote #1234 accepted by Sarah Smith"
            time="2 hours ago"
          />
          <ActivityItem
            icon="✅"
            title="Job completed"
            description="Moving job for Michael Johnson"
            time="5 hours ago"
          />
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  change,
  icon,
}: {
  title: string;
  value: string;
  change: number;
  icon: string;
}) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-neutral-600">{title}</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{value}</p>
          {change !== 0 && (
            <p
              className={`text-sm mt-1 ${
                change > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change > 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
            </p>
          )}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}

function QuickActionButton({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <a
      href={href}
      className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-neutral-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
    >
      <span className="text-3xl mb-2">{icon}</span>
      <span className="text-sm font-medium text-neutral-700">{label}</span>
    </a>
  );
}

function ActivityItem({
  icon,
  title,
  description,
  time,
}: {
  icon: string;
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-neutral-50 rounded-lg">
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <p className="font-medium text-neutral-900">{title}</p>
        <p className="text-sm text-neutral-600">{description}</p>
        <p className="text-xs text-neutral-500 mt-1">{time}</p>
      </div>
    </div>
  );
}
