import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { flexDirection: 'column', backgroundColor: '#ffffff', paddingTop: 30, paddingBottom: 40, paddingHorizontal: 0, fontFamily: 'Helvetica' },
  
  // Header / Cover styling
  headerSection: {
    backgroundColor: '#1e293b',
    padding: 30,
    paddingTop: 40,
    paddingBottom: 40,
    borderBottomWidth: 4,
    borderBottomColor: '#3b82f6',
  },
  header: { fontSize: 24, marginBottom: 8, fontWeight: 'bold', color: '#ffffff', letterSpacing: -0.5 },
  url: { fontSize: 11, color: '#94a3b8', fontWeight: 'medium' },
  
  // Score styling
  scoreWrapper: {
    alignItems: 'center',
    marginVertical: 30,
    padding: 24,
    backgroundColor: '#f8fafc',
    marginHorizontal: 30,
    borderRadius: 8,
  },
  scoreText: { fontSize: 60, fontWeight: 'bold', color: '#0f172a' },
  scoreLabel: { fontSize: 10, color: '#64748b', marginTop: 10, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 'bold' },
  
  // Content Sections
  contentArea: { paddingHorizontal: 30, paddingBottom: 20 },
  sectionTitle: { fontSize: 16, marginTop: 10, marginBottom: 16, color: '#0f172a', fontWeight: 'bold', borderBottomWidth: 2, borderBottomColor: '#cbd5e1', paddingBottom: 8 },
  
  // Category Blocks
  categoryBlock: {
    marginBottom: 30,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 8,
    marginBottom: 16,
    marginTop: 20,
  },
  categoryTitle: { fontSize: 15, fontWeight: 'bold', color: '#0f172a', textTransform: 'capitalize' },
  categoryScore: { fontSize: 12, fontWeight: 'bold', color: '#3b82f6', backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  
  // Lists
  listGroup: { marginBottom: 16 },
  listHeading: { fontSize: 10, fontWeight: 'bold', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  bullet: { flexDirection: 'row', marginBottom: 6, alignItems: 'flex-start' },
  bulletPoint: { width: 12, fontSize: 10, fontWeight: 'bold', marginTop: -1 },
  bulletText: { flex: 1, fontSize: 9, lineHeight: 1.5, color: '#475569' },
  
  // Tables
  tableContainer: { marginTop: 12 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f1f5f9', paddingVertical: 8, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#cbd5e1' },
  tableHeaderText: { fontSize: 8, fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  checkRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingVertical: 10, paddingHorizontal: 10 },
  
  // Table Columns
  colStatus: { width: '12%', justifyContent: 'center' },
  colCheck: { width: '35%', paddingRight: 8 },
  colImpact: { width: '13%' },
  colRemediation: { flex: 1 },
  
  // Text inside tables
  checkName: { fontSize: 9, color: '#1e293b', fontWeight: 'bold', lineHeight: 1.4 },
  checkRemediation: { fontSize: 9, color: '#475569', lineHeight: 1.4 },
  
  // Badges
  badge: { paddingHorizontal: 5, paddingVertical: 3, borderRadius: 4, alignSelf: 'flex-start' },
  badgeText: { fontSize: 7, fontWeight: 'bold', textTransform: 'uppercase' },
  
  badgePassBg: { backgroundColor: '#dcfce7' },
  badgePassText: { color: '#166534' },
  
  badgeFailBg: { backgroundColor: '#fee2e2' },
  badgeFailText: { color: '#991b1b' },
  
  badgeImpactCritBg: { backgroundColor: '#fecaca' },
  badgeImpactCritText: { color: '#991b1b' },
  
  badgeImpactHighBg: { backgroundColor: '#ffedd5' },
  badgeImpactHighText: { color: '#9a3412' },
  
  badgeImpactLowBg: { backgroundColor: '#f1f5f9' },
  badgeImpactLowText: { color: '#475569' }
});

const getImpactBadge = (impact: string) => {
  const i = impact?.toLowerCase() || '';
  if (i === 'critical') return { bg: styles.badgeImpactCritBg, text: styles.badgeImpactCritText };
  if (i === 'high') return { bg: styles.badgeImpactHighBg, text: styles.badgeImpactHighText };
  return { bg: styles.badgeImpactLowBg, text: styles.badgeImpactLowText };
};

export const ReportPDF = ({ data }: { data: any }) => {
  const { report } = data;
  
  return (
    <Document>
      {/* Cover Page & Executive Summary */}
      <Page size="A4" style={styles.page}>
        <View style={styles.headerSection}>
          <Text style={styles.header}>G99 WebAudit Report</Text>
          <Text style={styles.url}>{data.url}</Text>
        </View>
        
        <View style={styles.scoreWrapper}>
          <Text style={[styles.scoreText, { color: report.overallScore >= 90 ? '#16a34a' : report.overallScore >= 70 ? '#d97706' : '#dc2626' }]}>
            {report.overallScore}
          </Text>
          <Text style={styles.scoreLabel}>OVERALL WEBSITE SCORE</Text>
        </View>
        
        <View style={styles.contentArea}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          
          <View style={styles.listGroup}>
            <Text style={[styles.listHeading, { color: '#16a34a' }]}>Top Strengths</Text>
            {report.executiveSummary.topStrengths.map((str: string, i: number) => (
              <View key={i} style={styles.bullet}>
                <Text style={[styles.bulletPoint, { color: '#16a34a' }]}>✓</Text>
                <Text style={styles.bulletText}>{str}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.listGroup, { marginTop: 20 }]}>
            <Text style={[styles.listHeading, { color: '#dc2626' }]}>Priority Fixes</Text>
            {report.executiveSummary.priorityFixes.map((fix: string, i: number) => (
              <View key={i} style={styles.bullet}>
                <Text style={[styles.bulletPoint, { color: '#dc2626' }]}>×</Text>
                <Text style={styles.bulletText}>{fix}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>

      {/* Detailed Categories Pages */}
      <Page size="A4" style={styles.page}>
        <View style={[styles.headerSection, { paddingBottom: 20, paddingTop: 30 }]}>
          <Text style={[styles.header, { fontSize: 24 }]}>Detailed Category Audits</Text>
          <Text style={styles.url}>Comprehensive breakdown of all AI engines</Text>
        </View>
        
        <View style={[styles.contentArea, { paddingTop: 30 }]}>
          {Object.keys(report.rawResults).filter(category => report.rawResults[category as keyof typeof report.rawResults] != null).map((category, catIdx) => {
            const result = report.rawResults[category as keyof typeof report.rawResults]!;
            if (!result.checks || result.checks.length === 0) return null;

            return (
              <View key={category} style={styles.categoryBlock} break={catIdx > 0}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryTitle}>{category} Analysis</Text>
                  <Text style={styles.categoryScore}>{result.score}/100</Text>
                </View>
                
                {result.observations && result.observations.length > 0 && (
                  <View style={styles.listGroup} wrap={false}>
                    <Text style={[styles.listHeading, { color: '#475569' }]}>Key Observations</Text>
                    {result.observations.map((obs: string, i: number) => (
                      <View key={`obs-${i}`} style={styles.bullet}>
                        <Text style={[styles.bulletPoint, { color: '#94a3b8' }]}>•</Text>
                        <Text style={styles.bulletText}>{obs}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {result.issues && result.issues.length > 0 && (
                  <View style={styles.listGroup} wrap={false}>
                    <Text style={[styles.listHeading, { color: '#dc2626' }]}>Issues Found</Text>
                    {result.issues.map((iss: string, i: number) => (
                      <View key={`iss-${i}`} style={styles.bullet}>
                        <Text style={[styles.bulletPoint, { color: '#f87171' }]}>•</Text>
                        <Text style={styles.bulletText}>{iss}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {result.recommendations && result.recommendations.length > 0 && (
                  <View style={styles.listGroup} wrap={false}>
                    <Text style={[styles.listHeading, { color: '#16a34a' }]}>Actionable Recommendations</Text>
                    {result.recommendations.map((rec: string, i: number) => (
                      <View key={`rec-${i}`} style={styles.bullet}>
                        <Text style={[styles.bulletPoint, { color: '#4ade80' }]}>•</Text>
                        <Text style={styles.bulletText}>{rec}</Text>
                      </View>
                    ))}
                  </View>
                )}
                
                <View style={styles.tableContainer}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, styles.colStatus]}>Status</Text>
                    <Text style={[styles.tableHeaderText, styles.colCheck]}>Audit Check</Text>
                    <Text style={[styles.tableHeaderText, styles.colImpact]}>Impact</Text>
                    <Text style={[styles.tableHeaderText, styles.colRemediation]}>Remediation</Text>
                  </View>
                  
                  {result.checks.map((check: any, idx: number) => {
                    const impactStyle = getImpactBadge(check.impact);
                    return (
                      <View key={`chk-${idx}`} style={[styles.checkRow, { backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }]} wrap={false}>
                        <View style={styles.colStatus}>
                          <View style={[styles.badge, check.passed ? styles.badgePassBg : styles.badgeFailBg]}>
                            <Text style={[styles.badgeText, check.passed ? styles.badgePassText : styles.badgeFailText]}>
                              {check.passed ? 'PASS' : 'FAIL'}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.colCheck}>
                          <Text style={styles.checkName}>{check.checkName}</Text>
                        </View>
                        <View style={styles.colImpact}>
                          {!check.passed && check.impact ? (
                            <View style={[styles.badge, impactStyle.bg]}>
                              <Text style={[styles.badgeText, impactStyle.text]}>{check.impact}</Text>
                            </View>
                          ) : <Text style={styles.checkRemediation}>—</Text>}
                        </View>
                        <View style={styles.colRemediation}>
                          <Text style={styles.checkRemediation}>
                            {check.passed ? '—' : check.remediation || 'No remediation provided.'}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
};
