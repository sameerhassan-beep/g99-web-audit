import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { flexDirection: 'column', padding: 40, fontFamily: 'Helvetica' },
  header: { fontSize: 28, marginBottom: 20, fontWeight: 'bold', color: '#1e293b' },
  url: { fontSize: 14, color: '#64748b', marginBottom: 20 },
  sectionTitle: { fontSize: 18, marginTop: 25, marginBottom: 15, color: '#2563eb', fontWeight: 'bold' },
  categoryTitle: { fontSize: 16, marginTop: 20, marginBottom: 10, fontWeight: 'bold', color: '#0f172a', textTransform: 'capitalize' },
  text: { fontSize: 12, marginBottom: 8, lineHeight: 1.5, color: '#334155' },
  scoreContainer: { alignItems: 'center', marginVertical: 30 },
  scoreText: { fontSize: 56, fontWeight: 'bold', color: '#0f172a' },
  scoreLabel: { fontSize: 14, color: '#64748b', marginTop: 5, textTransform: 'uppercase' },
  bullet: { flexDirection: 'row', marginBottom: 5 },
  bulletPoint: { width: 15, fontSize: 12, color: '#3b82f6' },
  bulletText: { flex: 1, fontSize: 12, lineHeight: 1.5, color: '#334155' },
  checkRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingVertical: 8 },
  checkStatus: { width: 60, fontSize: 10, fontWeight: 'bold' },
  checkName: { width: '35%', fontSize: 10, paddingRight: 10, color: '#1e293b', fontWeight: 'bold' },
  checkImpact: { width: 60, fontSize: 9, textTransform: 'uppercase' },
  checkRemediation: { flex: 1, fontSize: 10, color: '#475569' },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#cbd5e1', paddingBottom: 5, marginTop: 10 },
  tableHeaderText: { fontSize: 10, fontWeight: 'bold', color: '#64748b' }
});

export const ReportPDF = ({ data }: { data: any }) => {
  const { report } = data;
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.header}>Website Audit Report</Text>
          <Text style={styles.url}>{data.url}</Text>
        </View>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>{report.overallScore}</Text>
          <Text style={styles.scoreLabel}>Overall G99 WebAudit Score (out of 100)</Text>
        </View>
        
        <View>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <Text style={[styles.text, { fontWeight: 'bold', marginTop: 10 }]}>Top Strengths:</Text>
          {report.executiveSummary.topStrengths.map((str: string, i: number) => (
            <View key={i} style={styles.bullet}>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.bulletText}>{str}</Text>
            </View>
          ))}

          <Text style={[styles.text, { fontWeight: 'bold', marginTop: 15, color: '#ef4444' }]}>Priority Fixes:</Text>
          {report.executiveSummary.priorityFixes.map((fix: string, i: number) => (
            <View key={i} style={styles.bullet}>
              <Text style={[styles.bulletPoint, { color: '#ef4444' }]}>•</Text>
              <Text style={styles.bulletText}>{fix}</Text>
            </View>
          ))}
        </View>
      </Page>

      {/* Detailed Categories Page(s) */}
      <Page size="A4" style={styles.page}>
        <Text style={[styles.header, { marginBottom: 30 }]}>Detailed Category Audits</Text>
        
        {Object.keys(report.rawResults).filter(category => report.rawResults[category as keyof typeof report.rawResults] != null).map(category => {
          const result = report.rawResults[category as keyof typeof report.rawResults]!;
          if (!result.checks || result.checks.length === 0) return null;

          return (
            <View key={category} style={{ marginBottom: 30, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' }}>
              <Text style={styles.categoryTitle}>{category} Analysis (Score: {result.score})</Text>
              
              {result.observations && result.observations.length > 0 && (
                <View style={{ marginBottom: 10 }}>
                  <Text style={[styles.text, { fontWeight: 'bold' }]}>Observations:</Text>
                  {result.observations.map((obs: string, i: number) => (
                    <Text key={i} style={styles.text}>• {obs}</Text>
                  ))}
                </View>
              )}

              {result.issues && result.issues.length > 0 && (
                <View style={{ marginBottom: 10 }}>
                  <Text style={[styles.text, { fontWeight: 'bold', color: '#ef4444' }]}>Issues:</Text>
                  {result.issues.map((iss: string, i: number) => (
                    <Text key={i} style={styles.text}>• {iss}</Text>
                  ))}
                </View>
              )}

              {result.recommendations && result.recommendations.length > 0 && (
                <View style={{ marginBottom: 15 }}>
                  <Text style={[styles.text, { fontWeight: 'bold', color: '#22c55e' }]}>Recommendations:</Text>
                  {result.recommendations.map((rec: string, i: number) => (
                    <Text key={i} style={styles.text}>• {rec}</Text>
                  ))}
                </View>
              )}
              
              <Text style={[styles.text, { fontWeight: 'bold', marginTop: 10, color: '#334155' }]}>Detailed Checks:</Text>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderText, { width: 60 }]}>Status</Text>
                <Text style={[styles.tableHeaderText, { width: '35%' }]}>Check</Text>
                <Text style={[styles.tableHeaderText, { width: 60 }]}>Impact</Text>
                <Text style={[styles.tableHeaderText, { flex: 1 }]}>Remediation</Text>
              </View>
              
              {result.checks.map((check: any, idx: number) => (
                <View key={idx} style={styles.checkRow} wrap={false}>
                  <Text style={[styles.checkStatus, { color: check.passed ? '#22c55e' : '#ef4444' }]}>
                    {check.passed ? 'PASS' : 'FAIL'}
                  </Text>
                  <Text style={styles.checkName}>{check.checkName}</Text>
                  <Text style={[styles.checkImpact, { color: check.impact === 'critical' || check.impact === 'high' ? '#ef4444' : '#f59e0b' }]}>
                    {!check.passed && check.impact ? check.impact : ''}
                  </Text>
                  <Text style={styles.checkRemediation}>
                    {check.passed ? '—' : check.remediation || 'No remediation provided.'}
                  </Text>
                </View>
              ))}
            </View>
          );
        })}
      </Page>
    </Document>
  );
};
