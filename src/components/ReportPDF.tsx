import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { 
    flexDirection: 'column', 
    backgroundColor: '#FAFAFC', 
    paddingTop: 40, 
    paddingBottom: 50, 
    paddingHorizontal: 0, 
    fontFamily: 'Helvetica' 
  },
  
  // Header / Cover styling
  headerSection: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    marginHorizontal: 30,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: { fontSize: 28, marginBottom: 8, fontWeight: 'bold', color: '#111827', letterSpacing: -0.5 },
  url: { fontSize: 12, color: '#6B7280', fontWeight: 'medium' },
  
  // Score styling
  scoreWrapper: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 30,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 30,
  },
  scoreText: { fontSize: 72, fontWeight: 'bold' },
  scoreLabel: { fontSize: 11, color: '#6B7280', marginTop: 10, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 'bold' },
  
  // Content Sections
  contentArea: { paddingHorizontal: 30, paddingBottom: 20 },
  sectionTitle: { fontSize: 18, marginBottom: 20, color: '#111827', fontWeight: 'bold' },
  
  // Executive Summary Blocks
  execBlock: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  // Category Blocks
  categoryBlock: {
    marginBottom: 40,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E7EB',
  },
  categoryTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', textTransform: 'capitalize' },
  categoryScore: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#4F46E5', 
    backgroundColor: '#EEF2FF', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 6 
  },
  
  // Lists
  listGroup: { marginBottom: 20 },
  listHeading: { fontSize: 11, fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  bullet: { flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' },
  bulletPoint: { width: 14, fontSize: 11, fontWeight: 'bold', marginTop: -1 },
  bulletText: { flex: 1, fontSize: 10, lineHeight: 1.6, color: '#4B5563' },
  
  // Tables
  tableContainer: { marginTop: 16, borderWidth: 1, borderColor: '#F3F4F6' },
  tableHeader: { 
    flexDirection: 'row', 
    backgroundColor: '#F9FAFB', 
    paddingVertical: 12, 
    paddingHorizontal: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB' 
  },
  tableHeaderText: { fontSize: 9, fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  checkRow: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6', 
    paddingVertical: 12, 
    paddingHorizontal: 12 
  },
  
  // Adjusted Column Widths to prevent overlap
  colStatus: { width: '15%', justifyContent: 'center' },
  colCheck: { width: '35%', paddingRight: 12 },
  colImpact: { width: '15%', paddingRight: 8 },
  colRemediation: { width: '35%' },
  
  // Text inside tables
  checkName: { fontSize: 9.5, color: '#111827', fontWeight: 'bold', lineHeight: 1.5 },
  checkRemediation: { fontSize: 9.5, color: '#4B5563', lineHeight: 1.5 },
  
  // Badges
  badge: { paddingHorizontal: 6, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start' },
  badgeText: { fontSize: 7.5, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  badgePassBg: { backgroundColor: '#DCFCE7' },
  badgePassText: { color: '#166534' },
  
  badgeFailBg: { backgroundColor: '#FEE2E2' },
  badgeFailText: { color: '#991B1B' },
  
  badgeImpactCritBg: { backgroundColor: '#FECACA' },
  badgeImpactCritText: { color: '#991B1B' },
  
  badgeImpactHighBg: { backgroundColor: '#FFEDD5' },
  badgeImpactHighText: { color: '#9A3412' },
  
  badgeImpactLowBg: { backgroundColor: '#F3F4F6' },
  badgeImpactLowText: { color: '#4B5563' }
});

const getImpactBadge = (impact: string) => {
  const i = impact?.toLowerCase() || '';
  if (i === 'critical') return { bg: styles.badgeImpactCritBg, text: styles.badgeImpactCritText };
  if (i === 'high') return { bg: styles.badgeImpactHighBg, text: styles.badgeImpactHighText };
  return { bg: styles.badgeImpactLowBg, text: styles.badgeImpactLowText };
};

export const ReportPDF = ({ data, category }: { data: any, category?: string }) => {
  const { report } = data;
  
  const categoriesToRender = category 
    ? [category] 
    : Object.keys(report.rawResults).filter(c => report.rawResults[c as keyof typeof report.rawResults] != null);
  
  return (
    <Document>
      {/* Cover Page & Executive Summary */}
      {!category && (
      <Page size="A4" style={styles.page}>
        <View style={styles.headerSection}>
          <Text style={styles.header}>G99 WebAudit Report</Text>
          <Text style={styles.url}>{data.url}</Text>
        </View>
        
        <View style={styles.scoreWrapper}>
          <Text style={[styles.scoreText, { color: report.overallScore >= 90 ? '#10B981' : report.overallScore >= 70 ? '#F59E0B' : '#EF4444' }]}>
            {report.overallScore}
          </Text>
          <Text style={styles.scoreLabel}>OVERALL WEBSITE SCORE</Text>
        </View>
        
        <View style={styles.contentArea}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          
          <View style={styles.execBlock}>
            <Text style={[styles.listHeading, { color: '#10B981', fontSize: 13, marginBottom: 14 }]}>Top Strengths</Text>
            {report.executiveSummary.topStrengths.map((str: string, i: number) => (
              <View key={i} style={styles.bullet}>
                <Text style={[styles.bulletPoint, { color: '#10B981' }]}>✓</Text>
                <Text style={styles.bulletText}>{str}</Text>
              </View>
            ))}
          </View>

          <View style={styles.execBlock}>
            <Text style={[styles.listHeading, { color: '#EF4444', fontSize: 13, marginBottom: 14 }]}>Priority Fixes</Text>
            {report.executiveSummary.priorityFixes.map((fix: string, i: number) => (
              <View key={i} style={styles.bullet}>
                <Text style={[styles.bulletPoint, { color: '#EF4444' }]}>×</Text>
                <Text style={styles.bulletText}>{fix}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>
      )}

      {/* Detailed Categories Pages */}
      <Page size="A4" style={styles.page}>
        <View style={[styles.headerSection, { paddingBottom: 30 }]}>
          <Text style={styles.header}>{category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Analysis` : 'Detailed Category Audits'}</Text>
          <Text style={styles.url}>{category ? data.url : 'Comprehensive breakdown of all AI engines'}</Text>
        </View>
        
        <View style={styles.contentArea}>
          {categoriesToRender.map((catName, catIdx) => {
            const result = report.rawResults[catName as keyof typeof report.rawResults]!;
            if (!result || !result.checks || result.checks.length === 0) return null;

            return (
              <View key={catName} style={styles.categoryBlock} break={catIdx > 0}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryTitle}>{catName} Analysis</Text>
                  <Text style={styles.categoryScore}>{result.score}/100</Text>
                </View>
                
                {result.observations && result.observations.length > 0 && (
                  <View style={styles.listGroup} wrap={false}>
                    <Text style={[styles.listHeading, { color: '#6B7280' }]}>Key Observations</Text>
                    {result.observations.map((obs: string, i: number) => (
                      <View key={`obs-${i}`} style={styles.bullet}>
                        <Text style={[styles.bulletPoint, { color: '#9CA3AF' }]}>•</Text>
                        <Text style={styles.bulletText}>{obs}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {result.issues && result.issues.length > 0 && (
                  <View style={styles.listGroup} wrap={false}>
                    <Text style={[styles.listHeading, { color: '#EF4444' }]}>Issues Found</Text>
                    {result.issues.map((iss: string, i: number) => (
                      <View key={`iss-${i}`} style={styles.bullet}>
                        <Text style={[styles.bulletPoint, { color: '#F87171' }]}>•</Text>
                        <Text style={styles.bulletText}>{iss}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {result.recommendations && result.recommendations.length > 0 && (
                  <View style={styles.listGroup} wrap={false}>
                    <Text style={[styles.listHeading, { color: '#10B981' }]}>Actionable Recommendations</Text>
                    {result.recommendations.map((rec: string, i: number) => (
                      <View key={`rec-${i}`} style={styles.bullet}>
                        <Text style={[styles.bulletPoint, { color: '#34D399' }]}>•</Text>
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
                      <View key={`chk-${idx}`} style={[styles.checkRow, { backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB' }]} wrap={false}>
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
