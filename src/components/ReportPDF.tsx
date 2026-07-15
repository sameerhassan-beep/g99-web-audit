import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { 
    flexDirection: 'column', 
    backgroundColor: '#FAFAFC', 
    paddingTop: 30, 
    paddingBottom: 30, 
    paddingHorizontal: 0, 
    fontFamily: 'Helvetica' 
  },
  
  // Header / Cover styling
  headerSection: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginHorizontal: 30,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: { fontSize: 20, marginBottom: 4, fontWeight: 'bold', color: '#111827', letterSpacing: -0.5 },
  url: { fontSize: 10, color: '#6B7280', fontWeight: 'medium' },
  
  // Score styling
  scoreWrapper: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  scoreText: { fontSize: 56, fontWeight: 'bold' },
  scoreLabel: { fontSize: 9.5, color: '#6B7280', marginTop: 6, textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 'bold' },
  
  // Content Sections
  contentArea: { paddingHorizontal: 30, paddingBottom: 16 },
  sectionTitle: { fontSize: 16, marginBottom: 16, color: '#111827', fontWeight: 'bold' },
  
  // Executive Summary Blocks
  execBlock: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  // Category Blocks
  categoryBlock: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryTitle: { fontSize: 15, fontWeight: 'bold', color: '#111827', textTransform: 'capitalize' },
  categoryScore: { 
    fontSize: 11, 
    fontWeight: 'bold', 
    color: '#4F46E5', 
    backgroundColor: '#EEF2FF', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 4 
  },
  
  // Lists
  listGroup: { marginBottom: 12 },
  listHeading: { fontSize: 9.5, fontWeight: 'bold', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  bullet: { flexDirection: 'row', marginBottom: 4, alignItems: 'flex-start' },
  bulletPoint: { width: 12, fontSize: 10, fontWeight: 'bold', marginTop: -1 },
  bulletText: { flex: 1, fontSize: 9.5, lineHeight: 1.4, color: '#4B5563' },
  
  // Tables
  tableContainer: { marginTop: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  tableHeader: { 
    flexDirection: 'row', 
    backgroundColor: '#F9FAFB', 
    paddingVertical: 8, 
    paddingHorizontal: 8, 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E7EB' 
  },
  tableHeaderText: { fontSize: 8.5, fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  checkRow: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomColor: '#F3F4F6', 
    paddingVertical: 8, 
    paddingHorizontal: 8 
  },
  
  // Adjusted Column Widths to prevent overlap
  colStatus: { width: '15%', justifyContent: 'center' },
  colCheck: { width: '35%', paddingRight: 10 },
  colImpact: { width: '15%', paddingRight: 6 },
  colRemediation: { width: '35%' },
  
  // Text inside tables
  checkName: { fontSize: 8.5, color: '#111827', fontWeight: 'bold', lineHeight: 1.4 },
  checkRemediation: { fontSize: 8.5, color: '#4B5563', lineHeight: 1.4 },
  
  // Badges
  badge: { paddingHorizontal: 5, paddingVertical: 3, borderRadius: 4, alignSelf: 'flex-start' },
  badgeText: { fontSize: 7, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  
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
      {categoriesToRender.map((catName, catIdx) => {
        const result = report.rawResults[catName as keyof typeof report.rawResults]!;
        if (!result || !result.checks || result.checks.length === 0) return null;

        return (
          <Page key={catName} size="A4" style={styles.page}>
            <View style={[styles.headerSection, { paddingBottom: 20 }]} fixed>
              <Text style={styles.header}>{catName.charAt(0).toUpperCase() + catName.slice(1)} Analysis</Text>
              <Text style={styles.url}>{data.url}</Text>
            </View>
            
            <View style={styles.contentArea}>
              <View style={styles.categoryBlock}>
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
                  <View style={styles.tableHeader} fixed>
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
            </View>
          </Page>
        );
      })}

      {/* Behavioral Analysis Page */}
      {report.clarityData && report.clarityData.metrics && (!category || category === 'behavioral') && (
        <Page size="A4" style={styles.page}>
          <View style={[styles.headerSection, { paddingBottom: 20 }]} fixed>
            <Text style={styles.header}>Behavioral Analysis</Text>
            <Text style={styles.url}>Powered by Microsoft Clarity</Text>
          </View>
          
          <View style={styles.contentArea}>
            <View style={styles.categoryBlock}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>Engagement Metrics</Text>
              </View>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                <View style={{ width: '31%', backgroundColor: '#F9FAFB', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' }}>
                  <Text style={{ fontSize: 9.5, fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>Dead Clicks</Text>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: report.clarityData.metrics.deadClicks > 5 ? '#EF4444' : '#111827' }}>
                    {report.clarityData.metrics.deadClicks || 0}
                  </Text>
                </View>
                <View style={{ width: '31%', backgroundColor: '#F9FAFB', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' }}>
                  <Text style={{ fontSize: 9.5, fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>Rage Clicks</Text>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: report.clarityData.metrics.rageClicks > 2 ? '#F97316' : '#111827' }}>
                    {report.clarityData.metrics.rageClicks || 0}
                  </Text>
                </View>
                <View style={{ width: '31%', backgroundColor: '#F9FAFB', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' }}>
                  <Text style={{ fontSize: 9.5, fontWeight: 'bold', color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>Scroll Depth</Text>
                  <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#111827' }}>
                    {report.clarityData.metrics.scrollDepthAverage || 0}%
                  </Text>
                </View>
              </View>

              {report.clarityData.metrics.highDropoffZones && report.clarityData.metrics.highDropoffZones.length > 0 && (
                <View style={[styles.listGroup, { backgroundColor: '#FEF2F2', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#FEE2E2', marginBottom: 16 }]} wrap={false}>
                  <Text style={[styles.listHeading, { color: '#991B1B', fontSize: 11, marginBottom: 8 }]}>High Drop-off Zones</Text>
                  {report.clarityData.metrics.highDropoffZones.map((zone: string, i: number) => (
                    <View key={`zone-${i}`} style={styles.bullet}>
                      <Text style={[styles.bulletPoint, { color: '#EF4444' }]}>•</Text>
                      <Text style={[styles.bulletText, { color: '#B91C1C' }]}>{zone}</Text>
                    </View>
                  ))}
                </View>
              )}

              {report.clarityData.insights && (
                <View style={[styles.listGroup, { backgroundColor: '#EEF2FF', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#E0E7FF' }]} wrap={false}>
                  <Text style={[styles.listHeading, { color: '#4338CA', fontSize: 12, marginBottom: 10 }]}>AI-Powered CRO Insights</Text>
                  {report.clarityData.insights.split('\n').map((paragraph: string, i: number) => {
                    if (!paragraph.trim()) return null;
                    return (
                      <Text key={`insight-${i}`} style={{ fontSize: 9.5, color: '#3730A3', lineHeight: 1.5, marginBottom: 8 }}>
                        {paragraph}
                      </Text>
                    );
                  })}
                </View>
              )}
              
            </View>
          </View>
        </Page>
      )}
    </Document>
  );
};
