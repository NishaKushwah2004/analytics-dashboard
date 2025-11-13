'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { exportToCSV, exportToExcel } from '@/lib/export';
import { Download } from 'lucide-react';


interface Invoice {
  id: string;
  vendor: string;
  date: Date;
  invoiceNumber: string;
  amount: number;
  status: string;
}

interface InvoicesTableProps {
  initialData: {
    invoices: Invoice[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export function InvoicesTable({ initialData }: InvoicesTableProps) {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchInvoices = async (page: number, searchTerm: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search: searchTerm,
      });

      const response = await fetch(`/api/invoices?${params}`);
      const newData = await response.json();
      setData(newData);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchInvoices(1, search);
  };

  const handlePageChange = (newPage: number) => {
    fetchInvoices(newPage, search);
  };

  const handleExport = (format: 'csv' | 'excel') => {
    const exportData = data.invoices.map(inv => ({
      Vendor: inv.vendor,
      Date: formatDate(inv.date),
      'Invoice Number': inv.invoiceNumber,
      Amount: inv.amount,
      Status: inv.status,
    }));
    
    if (format === 'csv') {
      exportToCSV(exportData, 'invoices');
    } else {
      exportToExcel(exportData, 'invoices', 'Invoices');
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold text-gray-900">
              Invoices by Vendor
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Top invoices by invoice count and net value
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search vendor or invoice..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 border-gray-300"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-gray-700 font-semibold">Vendor</TableHead>
                <TableHead className="text-gray-700 font-semibold"># Invoices</TableHead>
                <TableHead className="text-gray-700 font-semibold text-right">
                  Net Value
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-500">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                data.invoices.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">
                      {invoice.vendor}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatDate(invoice.date)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-gray-900">
                      {formatCurrency(invoice.amount)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-sm text-gray-600">
            Showing {data.invoices.length} of {data.total} invoices
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(data.page - 1)}
              disabled={data.page === 1 || loading}
              className="border-gray-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">
              Page {data.page} of {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(data.page + 1)}
              disabled={data.page === data.totalPages || loading}
              className="border-gray-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}