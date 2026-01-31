export interface SEOAuditResult {
  url: string;
  score: number;
  grade: string;
  checks: SEOCheck[];
  summary: string;
  canHelp: boolean;
}

export interface SEOCheck {
  name: string;
  passed: boolean;
  value?: string;
  recommendation?: string;
  importance: 'critical' | 'important' | 'minor';
}

export async function runSEOAudit(websiteUrl: string): Promise<SEOAuditResult | null> {
  try {
    // Normalize URL
    let url = websiteUrl.trim();
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }

    const startTime = Date.now();

    // Fetch the website with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SEOAuditBot/1.0)',
      },
    });

    clearTimeout(timeout);
    const loadTime = Date.now() - startTime;
    const html = await response.text();

    const checks: SEOCheck[] = [];

    // 1. HTTPS Check
    checks.push({
      name: 'HTTPS Enabled',
      passed: url.startsWith('https://') && response.ok,
      value: url.startsWith('https://') ? 'Yes' : 'No',
      recommendation: 'Site should use HTTPS for security',
      importance: 'critical',
    });

    // 2. Page Load Time
    checks.push({
      name: 'Page Load Speed',
      passed: loadTime < 3000,
      value: `${(loadTime / 1000).toFixed(2)}s`,
      recommendation: loadTime >= 3000 ? 'Page loads slowly (>3s)' : undefined,
      importance: 'important',
    });

    // 3. Title Tag
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';
    checks.push({
      name: 'Title Tag',
      passed: title.length >= 10 && title.length <= 70,
      value: title ? `${title.substring(0, 50)}${title.length > 50 ? '...' : ''} (${title.length} chars)` : 'Missing',
      recommendation: !title ? 'Add a title tag' : title.length < 10 ? 'Title too short' : title.length > 70 ? 'Title too long' : undefined,
      importance: 'critical',
    });

    // 4. Meta Description
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                          html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
    const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : '';
    checks.push({
      name: 'Meta Description',
      passed: metaDesc.length >= 50 && metaDesc.length <= 160,
      value: metaDesc ? `${metaDesc.substring(0, 50)}${metaDesc.length > 50 ? '...' : ''} (${metaDesc.length} chars)` : 'Missing',
      recommendation: !metaDesc ? 'Add a meta description' : metaDesc.length < 50 ? 'Description too short' : metaDesc.length > 160 ? 'Description too long' : undefined,
      importance: 'critical',
    });

    // 5. H1 Tag
    const h1Matches = html.match(/<h1[^>]*>[\s\S]*?<\/h1>/gi) || [];
    const h1Count = h1Matches.length;
    const h1Text = h1Matches[0]?.replace(/<[^>]*>/g, '').trim().substring(0, 50) || '';
    checks.push({
      name: 'H1 Tag',
      passed: h1Count === 1,
      value: h1Count === 0 ? 'Missing' : h1Count === 1 ? h1Text : `${h1Count} found (should be 1)`,
      recommendation: h1Count === 0 ? 'Add an H1 tag' : h1Count > 1 ? 'Use only one H1 tag per page' : undefined,
      importance: 'critical',
    });

    // 6. Mobile Viewport
    const hasViewport = /<meta[^>]*name=["']viewport["']/i.test(html);
    checks.push({
      name: 'Mobile Viewport',
      passed: hasViewport,
      value: hasViewport ? 'Present' : 'Missing',
      recommendation: !hasViewport ? 'Add viewport meta tag for mobile' : undefined,
      importance: 'critical',
    });

    // 7. Images with Alt Text
    const imgTags = html.match(/<img[^>]*>/gi) || [];
    const imgsWithAlt = imgTags.filter(img => /alt=["'][^"']+["']/i.test(img)).length;
    const imgAltPercent = imgTags.length > 0 ? Math.round((imgsWithAlt / imgTags.length) * 100) : 100;
    checks.push({
      name: 'Image Alt Text',
      passed: imgAltPercent >= 80,
      value: imgTags.length > 0 ? `${imgsWithAlt}/${imgTags.length} images (${imgAltPercent}%)` : 'No images found',
      recommendation: imgAltPercent < 80 ? 'Add alt text to images' : undefined,
      importance: 'important',
    });

    // 8. Open Graph Tags
    const hasOG = /<meta[^>]*property=["']og:/i.test(html);
    checks.push({
      name: 'Open Graph Tags',
      passed: hasOG,
      value: hasOG ? 'Present' : 'Missing',
      recommendation: !hasOG ? 'Add Open Graph tags for social sharing' : undefined,
      importance: 'minor',
    });

    // 9. Canonical Tag
    const hasCanonical = /<link[^>]*rel=["']canonical["']/i.test(html);
    checks.push({
      name: 'Canonical Tag',
      passed: hasCanonical,
      value: hasCanonical ? 'Present' : 'Missing',
      recommendation: !hasCanonical ? 'Add canonical tag to prevent duplicate content' : undefined,
      importance: 'important',
    });

    // 10. Check for basic structured data
    const hasSchema = /application\/ld\+json/i.test(html) || /itemtype=["']https?:\/\/schema\.org/i.test(html);
    checks.push({
      name: 'Schema Markup',
      passed: hasSchema,
      value: hasSchema ? 'Present' : 'Missing',
      recommendation: !hasSchema ? 'Add schema markup for rich results' : undefined,
      importance: 'important',
    });

    // Calculate score
    const weights = { critical: 3, important: 2, minor: 1 };
    const totalWeight = checks.reduce((sum, c) => sum + weights[c.importance], 0);
    const earnedWeight = checks.reduce((sum, c) => sum + (c.passed ? weights[c.importance] : 0), 0);
    const score = Math.round((earnedWeight / totalWeight) * 100);

    // Determine grade
    let grade: string;
    if (score >= 90) grade = 'A';
    else if (score >= 80) grade = 'B';
    else if (score >= 70) grade = 'C';
    else if (score >= 60) grade = 'D';
    else grade = 'F';

    // Determine if we can help (basic threshold)
    const criticalPassed = checks.filter(c => c.importance === 'critical' && c.passed).length;
    const criticalTotal = checks.filter(c => c.importance === 'critical').length;
    const canHelp = criticalPassed >= Math.floor(criticalTotal / 2); // At least half of critical checks pass

    // Generate summary
    const passedCount = checks.filter(c => c.passed).length;
    const failedCritical = checks.filter(c => !c.passed && c.importance === 'critical');

    let summary: string;
    if (score >= 80) {
      summary = `Good foundation! ${passedCount}/${checks.length} checks passed. Ready for Local SEO.`;
    } else if (score >= 60) {
      summary = `Decent site with room for improvement. ${failedCritical.length} critical issues to address.`;
    } else {
      summary = `Site needs work. ${failedCritical.length} critical SEO issues found.`;
    }

    return {
      url,
      score,
      grade,
      checks,
      summary,
      canHelp,
    };
  } catch (error) {
    console.error('SEO Audit error:', error);
    return null;
  }
}

export function formatAuditForSlack(audit: SEOAuditResult): object[] {
  const gradeEmoji = {
    'A': '🟢',
    'B': '🟢',
    'C': '🟡',
    'D': '🟠',
    'F': '🔴',
  }[audit.grade] || '⚪';

  const blocks: object[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `📊 SEO Audit: ${audit.grade} (${audit.score}/100)`,
        emoji: true
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${gradeEmoji} *${audit.summary}*\n🔗 ${audit.url}`
      }
    },
    {
      type: 'divider'
    }
  ];

  // Group checks by status
  const failed = audit.checks.filter(c => !c.passed);
  const passed = audit.checks.filter(c => c.passed);

  if (failed.length > 0) {
    const failedText = failed.map(c => {
      const icon = c.importance === 'critical' ? '🔴' : c.importance === 'important' ? '🟠' : '🟡';
      return `${icon} *${c.name}:* ${c.value}${c.recommendation ? `\n     _${c.recommendation}_` : ''}`;
    }).join('\n');

    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Issues Found (${failed.length}):*\n${failedText}`
      }
    });
  }

  if (passed.length > 0) {
    const passedText = passed.map(c => `✅ ${c.name}`).join('\n');
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Passing (${passed.length}):*\n${passedText}`
      }
    });
  }

  // Recommendation
  blocks.push({
    type: 'section',
    text: {
      type: 'mrkdwn',
      text: audit.canHelp
        ? `✅ *Recommendation:* This site has a solid enough foundation for Local SEO services.`
        : `⚠️ *Recommendation:* Site may need basic fixes before Local SEO will be effective.`
    }
  });

  return blocks;
}
