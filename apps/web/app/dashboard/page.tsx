import { OverviewCards } from '@/components/dashboard/overview-cards';
import { InvoiceTrendsChart } from '@/components/dashboard/invoice-trends-chart';
import { VendorSpendChart } from '@/components/dashboard/vendor-spend-chart';
import { CategorySpendChart } from '@/components/dashboard/category-spend-chart';
import { CashOutflowChart } from '@/components/dashboard/cash-outflow-chart';
import { InvoicesTable } from '@/components/dashboard/invoices-table';

async function getStats() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/stats`, { 
      cache: 'no-store'
    });
    if (!res.ok) return { totalSpend: 0, totalInvoices: 0, documentsUploaded: 0, avgInvoiceValue: 0 };
    return res.json();
  } catch {
    return { totalSpend: 0, totalInvoices: 0, documentsUploaded: 0, avgInvoiceValue: 0 };
  }
}

async function getTrends() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/invoice-trends`, { 
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getVendors() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/vendors/top10`, { 
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getCategorySpend() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/category-spend`, { 
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getCashOutflow() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/cash-outflow`, { 
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getInvoices() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/invoices?page=1&limit=10`, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    if (!res.ok) return { invoices: [], total: 0, page: 1, totalPages: 0 };
    return res.json();
  } catch {
    return { invoices: [], total: 0, page: 1, totalPages: 0 };
  }
}

export default async function DashboardPage() {
  const [stats, trends, vendors, categorySpend, cashOutflow, invoices] =
    await Promise.all([
      getStats(),
      getTrends(),
      getVendors(),
      getCategorySpend(),
      getCashOutflow(),
      getInvoices(),
    ]);

  return (
    <div className="h-full overflow-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Overview of your invoice analytics
            </p>
          </div>
          
          {/* User Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-sm font-bold text-white">
              NK
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Nisha Kushwah</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 space-y-6">
        {/* Overview Cards */}
        <OverviewCards stats={stats} />

        {/* Charts Grid - 2 Columns */}
        <div className="grid gap-6 lg:grid-cols-2">
          <InvoiceTrendsChart data={trends} />
          <VendorSpendChart data={vendors} />
        </div>

        {/* Second Row - 2 Columns */}
        <div className="grid gap-6 lg:grid-cols-2">
          <CategorySpendChart data={categorySpend} />
          <CashOutflowChart data={cashOutflow} />
        </div>

        {/* Full Width Table */}
        <InvoicesTable initialData={invoices} />
      </div>
    </div>
  );
}