import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { runSEOAudit, formatAuditForSlack } from '@/lib/seo-audit';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { firstName, lastName, city, businessName, address, phone, website, rating, reviewCount, email, userPhone } = data;

    // Format the submission details
    const submissionTime = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

    // Run SEO audit if website is provided
    let seoAudit = null;
    if (website) {
      seoAudit = await runSEOAudit(website);
    }

    // 1. Send Slack notification - Lead Info
    if (process.env.SLACK_WEBHOOK_URL) {
      const leadBlocks = [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '🎉 New Lead Submission!',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Name:*\n${firstName} ${lastName}` },
            { type: 'mrkdwn', text: `*Email:*\n${email}` },
            { type: 'mrkdwn', text: `*Phone:*\n${userPhone || 'Not provided'}` },
            { type: 'mrkdwn', text: `*City:*\n${city}` }
          ]
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Business:*\n${businessName}` },
            { type: 'mrkdwn', text: `*Address:*\n${address}` }
          ]
        },
        ...(rating > 0 ? [{
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Google Rating:*\n⭐ ${rating.toFixed(1)} (${reviewCount} reviews)` },
            { type: 'mrkdwn', text: `*Website:*\n${website || 'Not listed'}` }
          ]
        }] : []),
        {
          type: 'context',
          elements: [
            { type: 'mrkdwn', text: `Submitted at ${submissionTime}` }
          ]
        }
      ];

      // Send lead notification
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blocks: leadBlocks })
      });

      // Send SEO audit as separate message (if available)
      if (seoAudit) {
        const auditBlocks = formatAuditForSlack(seoAudit);
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blocks: auditBlocks })
        });
      } else if (website) {
        // Website provided but audit failed
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blocks: [{
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `⚠️ *SEO Audit Failed*\nCould not analyze website: ${website}\n_Site may be down or blocking requests._`
              }
            }]
          })
        });
      }
    }

    // 2. Send email notification (optional)
    if (process.env.RESEND_API_KEY && process.env.NOTIFICATION_EMAIL) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      // Build SEO audit HTML section if available
      const seoAuditHtml = seoAudit ? `
        <h2 style="color: #374151; margin-top: 24px;">SEO Audit Results</h2>
        <div style="background: ${seoAudit.canHelp ? '#ECFDF5' : '#FEF2F2'}; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <p style="margin: 0; font-size: 24px; font-weight: bold; color: ${seoAudit.canHelp ? '#059669' : '#DC2626'};">
            Grade: ${seoAudit.grade} (${seoAudit.score}/100)
          </p>
          <p style="margin: 8px 0 0 0; color: #374151;">${seoAudit.summary}</p>
        </div>
        <table style="width: 100%; border-collapse: collapse;">
          ${seoAudit.checks.map(check => `
            <tr>
              <td style="padding: 8px 0; color: #6B7280;">${check.passed ? '✅' : '❌'} ${check.name}</td>
              <td style="padding: 8px 0; color: #111827;">${check.value}</td>
            </tr>
          `).join('')}
        </table>
        <p style="margin-top: 16px; padding: 12px; background: ${seoAudit.canHelp ? '#ECFDF5' : '#FEF2F2'}; border-radius: 8px;">
          <strong>${seoAudit.canHelp ? '✅ Good candidate' : '⚠️ Needs work'}:</strong>
          ${seoAudit.canHelp ? 'This site has a solid foundation for Local SEO.' : 'Site may need fixes before Local SEO will be effective.'}
        </p>
      ` : '';

      await resend.emails.send({
        from: 'Touchpoint Media <notifications@resend.dev>',
        to: process.env.NOTIFICATION_EMAIL,
        subject: `🎉 New Lead: ${businessName} - ${firstName} ${lastName}${seoAudit ? ` [SEO: ${seoAudit.grade}]` : ''}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563EB; border-bottom: 2px solid #2563EB; padding-bottom: 10px;">New Lead Submission</h1>

            <h2 style="color: #374151; margin-top: 24px;">Contact Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6B7280; width: 120px;">Name:</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 500;">${firstName} ${lastName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Email:</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 500;">
                  <a href="mailto:${email}" style="color: #2563EB;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Phone:</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 500;">
                  ${userPhone ? `<a href="tel:${userPhone}" style="color: #2563EB;">${userPhone}</a>` : 'Not provided'}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">City:</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 500;">${city}</td>
              </tr>
            </table>

            <h2 style="color: #374151; margin-top: 24px;">Business Information</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6B7280; width: 120px;">Business:</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 500;">${businessName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Address:</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 500;">${address}</td>
              </tr>
              ${rating > 0 ? `
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Google Rating:</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 500;">⭐ ${rating.toFixed(1)} (${reviewCount} reviews)</td>
              </tr>
              ` : ''}
              ${website ? `
              <tr>
                <td style="padding: 8px 0; color: #6B7280;">Website:</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 500;">
                  <a href="${website}" style="color: #2563EB;">${website}</a>
                </td>
              </tr>
              ` : ''}
            </table>

            ${seoAuditHtml}

            <p style="color: #9CA3AF; font-size: 12px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #E5E7EB;">
              Submitted at ${submissionTime}
            </p>
          </div>
        `
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json({ error: 'Failed to process submission' }, { status: 500 });
  }
}
