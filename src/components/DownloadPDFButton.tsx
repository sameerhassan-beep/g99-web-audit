'use client';

import React, { useEffect, useState } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportPDF } from './ReportPDF';
import { Download } from 'lucide-react';

export default function DownloadPDFButton({ data, category }: { data: any, category?: string }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <PDFDownloadLink
      document={<ReportPDF data={data} category={category} />}
      fileName={category ? `audit-report-${category}-${new Date().getTime()}.pdf` : `audit-report-${new Date().getTime()}.pdf`}
      className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-full font-medium transition-colors dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 shadow-sm"
    >
      {({ loading }) => (
        <>
          <Download className="w-4 h-4" />
          {loading ? (category ? `Generating ${category.toUpperCase()} PDF...` : 'Generating PDF...') : (category ? `Download ${category.toUpperCase()} PDF` : 'Download Full PDF')}
        </>
      )}
    </PDFDownloadLink>
  );
}
