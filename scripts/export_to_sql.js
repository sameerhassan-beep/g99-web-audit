/**
 * INSTRUCTIONS:
 * 1. Open your G99 WebAudit dashboard in the browser (e.g., http://localhost:3000/dashboard)
 * 2. Open the Developer Tools (F12 or Right Click -> Inspect)
 * 3. Go to the "Console" tab
 * 4. Paste this entire script into the console and press Enter
 * 5. It will generate and download a file named 'seed_current_data.sql'
 * 6. You can run this .sql file in your Supabase SQL Editor to migrate your data!
 */

(function exportLocalStorageToSQL() {
    const rawData = localStorage.getItem('pastAudits');
    if (!rawData) {
        console.warn('No past audits found in localStorage.');
        return;
    }

    const audits = JSON.parse(rawData);
    if (!Array.isArray(audits) || audits.length === 0) {
        console.warn('No audits to export.');
        return;
    }

    let sqlStatements = `-- G99 WebAudit Local Storage Data Export\n`;
    sqlStatements += `-- Generated on: ${new Date().toISOString()}\n\n`;

    audits.forEach(audit => {
        // Escape single quotes for SQL
        const escapeSql = (str) => {
            if (str === null || str === undefined) return 'NULL';
            return "'" + String(str).replace(/'/g, "''") + "'";
        };

        const id = escapeSql(audit.id);
        const url = escapeSql(audit.url);
        const date = escapeSql(audit.date);
        const overall_score = audit.report?.overallScore || 0;
        
        // Convert objects to JSON string, then escape for SQL
        const report = escapeSql(JSON.stringify(audit.report));
        const screenshots = escapeSql(JSON.stringify(audit.screenshots || []));
        const sub_pages = escapeSql(JSON.stringify(audit.subPages || []));

        sqlStatements += `INSERT INTO public.audits (id, url, date, overall_score, report, screenshots, sub_pages) `;
        sqlStatements += `VALUES (${id}, ${url}, ${date}, ${overall_score}, ${report}::jsonb, ${screenshots}::jsonb, ${sub_pages}::jsonb) `;
        sqlStatements += `ON CONFLICT (id) DO NOTHING;\n\n`;
    });

    // Create a blob and trigger download
    const blob = new Blob([sqlStatements], { type: 'text/plain' });
    const downloadUrl = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'seed_current_data.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);

    console.log('%c✅ Export Complete!', 'color: green; font-weight: bold; font-size: 16px;');
    console.log('Check your downloads folder for seed_current_data.sql');
})();
