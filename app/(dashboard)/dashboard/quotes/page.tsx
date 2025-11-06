'use client';

import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Quote } from '@/types';
import Link from 'next/link';
import { formatCurrency } from '@/lib/quote-calculator';

export default function QuotesPage() {
  const { claims } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'sent' | 'accepted' | 'rejected'>('all');

  useEffect(() => {
    if (!claims?.tenantId) return;

    const quotesQuery = query(
      collection(db, `tenants/${claims.tenantId}/quotes`),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(quotesQuery, (snapshot) => {
      const quotesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Quote[];

      setQuotes(quotesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [claims]);

  const filteredQuotes = quotes.filter((quote) => {
    if (filter === 'all') return true;
    return quote.status === filter;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-neutral-100 text-neutral-800',
      sent: 'bg-blue-100 text-blue-800',
      viewed: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-orange-100 text-orange-800',
    };
    return colors[status as keyof typeof colors] || 'bg-neutral-100 text-neutral-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Quotes</h1>
          <p className="text-neutral-600 mt-1">Create and manage customer quotes</p>
        </div>
        <Link href="/dashboard/quotes/new" className="btn btn-primary">
          + New Quote
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-neutral-200">
        {['all', 'draft', 'sent', 'accepted', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status as any)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              filter === status
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {status}
            {status === 'all' && (
              <span className="ml-2 text-xs bg-neutral-100 px-2 py-1 rounded-full">
                {quotes.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="text-sm text-neutral-600">Total Quote Value</div>
          <div className="text-2xl font-bold text-neutral-900 mt-1">
            {formatCurrency(filteredQuotes.reduce((sum, q) => sum + q.total, 0))}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-neutral-600">Acceptance Rate</div>
          <div className="text-2xl font-bold text-neutral-900 mt-1">
            {quotes.length > 0
              ? ((quotes.filter((q) => q.status === 'accepted').length / quotes.length) * 100).toFixed(1)
              : 0}%
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-neutral-600">Average Quote</div>
          <div className="text-2xl font-bold text-neutral-900 mt-1">
            {formatCurrency(quotes.length > 0 ? quotes.reduce((sum, q) => sum + q.total, 0) / quotes.length : 0)}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-neutral-600">Pending Quotes</div>
          <div className="text-2xl font-bold text-neutral-900 mt-1">
            {quotes.filter((q) => q.status === 'sent' || q.status === 'viewed').length}
          </div>
        </div>
      </div>

      {/* Quotes Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Quote #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Margin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Valid Until
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-neutral-500">
                    No quotes found
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                      {quote.quoteNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {/* Customer name would be fetched from customer ID */}
                      Customer #{quote.customerId.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {formatCurrency(quote.total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={quote.marginPercentage >= 20 ? 'text-green-600' : 'text-orange-600'}>
                        {quote.marginPercentage.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(quote.status)}`}>
                        {quote.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {quote.validUntil?.toDate().toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/dashboard/quotes/${quote.id}`}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        View
                      </Link>
                      <Link
                        href={`/dashboard/quotes/${quote.id}/edit`}
                        className="text-neutral-600 hover:text-neutral-900"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
