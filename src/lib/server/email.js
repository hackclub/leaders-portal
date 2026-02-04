import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';

// Create reusable transporter
function getTransporter() {
	if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
		throw new Error("Missing SMTP configuration. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS environment variables.");
	}
	
	return nodemailer.createTransport({
		host: env.SMTP_HOST,
		port: parseInt(env.SMTP_PORT || '587'),
		secure: env.SMTP_PORT === '465',
		auth: {
			user: env.SMTP_USER,
			pass: env.SMTP_PASS
		}
	});
}

// Base email template with Hack Club styling (light theme)
function getEmailTemplate({ title, content, footerText = '', preheader = '' }) {
	return `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${title}</title>
	<!--[if mso]>
	<style type="text/css">
		body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
	</style>
	<![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
	${preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>` : ''}
	<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5;">
		<tr>
			<td align="center" style="padding: 40px 20px;">
				<table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);">
					<!-- Header -->
					<tr>
						<td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #e5e5e5;">
							<img src="https://assets.hackclub.com/icon-rounded.png" alt="Hack Club" width="48" height="48" style="border-radius: 10px; margin-bottom: 16px;">
							<h1 style="margin: 0; color: #ec3750; font-size: 22px; font-weight: 700;">${title}</h1>
						</td>
					</tr>
					
					<!-- Content -->
					<tr>
						<td style="padding: 32px;">
							${content}
						</td>
					</tr>
					
					<!-- Footer -->
					<tr>
						<td style="padding: 24px 32px; text-align: center; border-top: 1px solid #e5e5e5; background-color: #fafafa; border-radius: 0 0 12px 12px;">
							<p style="margin: 0 0 8px; color: #666666; font-size: 13px;">
								${footerText || 'This email was sent by Hack Club Leaders Portal'}
							</p>
							<p style="margin: 0; color: #999999; font-size: 12px;">
								© ${new Date().getFullYear()} Hack Club · <a href="https://hackclub.com" style="color: #ec3750; text-decoration: none;">hackclub.com</a>
							</p>
						</td>
					</tr>
				</table>
			</td>
		</tr>
	</table>
</body>
</html>
`;
}

export async function sendOTPEmail(email, code) {
	const transporter = getTransporter();
	
	const content = `
		<p style="margin: 0 0 24px; color: #333333; font-size: 16px; line-height: 1.6;">
			Enter this verification code to sign in to your Hack Club Leaders Portal account:
		</p>
		
		<div style="background-color: #fef2f2; border: 2px solid #ec3750; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
			<span style="font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 32px; font-weight: 700; color: #ec3750; letter-spacing: 6px;">${code}</span>
		</div>
		
		<p style="margin: 0 0 16px; color: #666666; font-size: 14px; line-height: 1.5;">
			This code will expire in <strong style="color: #333333;">15 minutes</strong>.
		</p>
		
		<p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.5;">
			If you didn't request this code, you can safely ignore this email. Someone may have entered your email address by mistake.
		</p>
	`;
	
	const html = getEmailTemplate({
		title: 'Your Verification Code',
		content,
		preheader: `Your code is ${code}`,
		footerText: "You're receiving this because you requested to sign in to the Leaders Portal."
	});
	
	try {
		await transporter.sendMail({
			from: `"Hack Club" <${env.SMTP_FROM || env.SMTP_USER}>`,
			to: email,
			subject: `${code} is your Hack Club verification code`,
			text: `Your Hack Club verification code is: ${code}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this code, you can safely ignore this email.`,
			html
		});
		
		console.log(`Sent OTP email to ${email}`);
		return true;
	} catch (error) {
		console.error('Error sending OTP email:', error);
		throw new Error("Failed to send verification email");
	}
}

export async function sendCoLeaderInvitation({ inviteeEmail, clubName, inviterName, message, invitationId }) {
	const transporter = getTransporter();
	
	const personalMessageHtml = message ? `
		<div style="background-color: #f0f9ff; border-left: 4px solid #338eda; border-radius: 4px; padding: 16px; margin-bottom: 24px;">
			<p style="margin: 0 0 8px; color: #666666; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Message from ${inviterName}:</p>
			<p style="margin: 0; color: #333333; font-size: 15px; font-style: italic; line-height: 1.5;">"${message}"</p>
		</div>
	` : '';
	
	const content = `
		<p style="margin: 0 0 24px; color: #333333; font-size: 16px; line-height: 1.6;">
			<strong>${inviterName}</strong> has invited you to become a co-leader of <strong style="color: #ec3750;">${clubName}</strong> on Hack Club!
		</p>
		
		${personalMessageHtml}
		
		<p style="margin: 0 0 24px; color: #666666; font-size: 14px; line-height: 1.5;">
			As a co-leader, you'll be able to manage club events, track member engagement, and access all the awesome tools in the Leaders Portal.
		</p>
		
		<div style="text-align: center; margin: 32px 0;">
			<a href="https://leaders.hackclub.com/invite-coleader/${invitationId}" style="display: inline-block; background-color: #ec3750; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
				Accept Invitation
			</a>
		</div>
		
		<p style="margin: 0; color: #999999; font-size: 13px; text-align: center;">
			Or copy this link: <span style="color: #338eda;">leaders.hackclub.com/invite-coleader/${invitationId}</span>
		</p>
	`;
	
	const html = getEmailTemplate({
		title: "You're Invited! 🎉",
		content,
		preheader: `${inviterName} invited you to co-lead ${clubName}`,
		footerText: `You're receiving this because ${inviterName} invited you to co-lead ${clubName}.`
	});
	
	try {
		await transporter.sendMail({
			from: `"Hack Club" <${env.SMTP_FROM || env.SMTP_USER}>`,
			to: inviteeEmail,
			subject: `${inviterName} invited you to co-lead ${clubName}!`,
			text: `${inviterName} has invited you to become a co-leader of ${clubName} on Hack Club!\n\n${message ? `Personal message: "${message}"\n\n` : ''}Accept the invitation: https://leaders.hackclub.com/invite-coleader/${invitationId}`,
			html
		});
		
		console.log(`Sent co-leader invitation email to ${inviteeEmail} for ${clubName}`);
		return true;
	} catch (error) {
		console.error('Error sending co-leader invitation email:', error);
		console.warn('Email failed to send, but invitation was stored');
		return false;
	}
}

export async function sendLeaveVerificationEmail(email, code, memberName, clubName) {
	const transporter = getTransporter();
	
	const content = `
		<p style="margin: 0 0 24px; color: #333333; font-size: 16px; line-height: 1.6;">
			Hi <strong>${memberName}</strong>, we received a request to remove you from <strong style="color: #ec3750;">${clubName}</strong>.
		</p>
		
		<p style="margin: 0 0 16px; color: #666666; font-size: 14px; line-height: 1.5;">
			Enter this verification code to confirm:
		</p>
		
		<div style="background-color: #f5f5f5; border: 2px solid #e5e5e5; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
			<span style="font-family: 'SF Mono', Monaco, Consolas, monospace; font-size: 32px; font-weight: 700; color: #333333; letter-spacing: 6px;">${code}</span>
		</div>
		
		<p style="margin: 0 0 16px; color: #666666; font-size: 14px; line-height: 1.5;">
			This code will expire in <strong style="color: #333333;">15 minutes</strong>.
		</p>
		
		<div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px 16px; margin-top: 24px;">
			<p style="margin: 0; color: #991b1b; font-size: 13px; line-height: 1.5;">
				⚠️ If you didn't request to leave this club, please ignore this email and contact the club leaders if you have concerns.
			</p>
		</div>
	`;
	
	const html = getEmailTemplate({
		title: 'Confirm Club Departure',
		content,
		preheader: `Your verification code is ${code}`,
		footerText: `You're receiving this because someone requested to leave ${clubName}.`
	});
	
	try {
		await transporter.sendMail({
			from: `"Hack Club" <${env.SMTP_FROM || env.SMTP_USER}>`,
			to: email,
			subject: `${code} - Verify leaving ${clubName}`,
			text: `Hi ${memberName},\n\nYour verification code to leave ${clubName} is: ${code}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request this, please ignore this email.`,
			html
		});
		
		console.log(`Sent leave verification email to ${email} for ${clubName}`);
		return true;
	} catch (error) {
		console.error('Error sending leave verification email:', error);
		throw new Error("Failed to send verification email");
	}
}

export async function sendClubAnnouncement({ recipientEmail, recipientName, clubName, subject, message, senderName }) {
	const transporter = getTransporter();
	
	const content = `
		<p style="margin: 0 0 8px; color: #666666; font-size: 13px;">
			Announcement from <strong style="color: #ec3750;">${clubName}</strong>
		</p>
		
		${subject ? `<h2 style="margin: 0 0 20px; color: #333333; font-size: 20px; font-weight: 600;">${subject}</h2>` : ''}
		
		<div style="background-color: #fafafa; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
			<p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${message}</p>
		</div>
		
		<p style="margin: 0; color: #999999; font-size: 13px;">
			— ${senderName || 'Your club leaders'}
		</p>
	`;
	
	const html = getEmailTemplate({
		title: '📢 Club Announcement',
		content,
		preheader: subject || message.substring(0, 100),
		footerText: `You're receiving this because you're a member of ${clubName}.`
	});
	
	try {
		await transporter.sendMail({
			from: `"${clubName} via Hack Club" <${env.SMTP_FROM || env.SMTP_USER}>`,
			to: recipientEmail,
			subject: subject ? `[${clubName}] ${subject}` : `Announcement from ${clubName}`,
			text: `Announcement from ${clubName}\n\n${subject ? subject + '\n\n' : ''}${message}\n\n— ${senderName || 'Your club leaders'}`,
			html
		});
		
		console.log(`Sent club announcement to ${recipientEmail}`);
		return true;
	} catch (error) {
		console.error('Error sending club announcement:', error);
		return false;
	}
}

export async function sendEventNotification({ recipientEmail, recipientName, clubName, eventTitle, eventDescription, eventDate, eventLocation, eventUrl }) {
	const transporter = getTransporter();
	
	const formattedDate = eventDate ? new Date(eventDate).toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	}) : null;
	
	const content = `
		<p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
			${recipientName ? `Hey ${recipientName}! ` : ''}You're invited to an upcoming event from <strong style="color: #ec3750;">${clubName}</strong>:
		</p>
		
		<div style="background-color: #fafafa; border-left: 4px solid #ec3750; border-radius: 4px; padding: 20px; margin-bottom: 24px;">
			<h2 style="margin: 0 0 12px; color: #333333; font-size: 20px; font-weight: 600;">${eventTitle}</h2>
			
			${formattedDate ? `
				<p style="margin: 0 0 8px; color: #666666; font-size: 14px;">
					📅 <strong>${formattedDate}</strong>
				</p>
			` : ''}
			
			${eventLocation ? `
				<p style="margin: 0 0 12px; color: #666666; font-size: 14px;">
					📍 ${eventLocation}
				</p>
			` : ''}
			
			${eventDescription ? `
				<p style="margin: 16px 0 0; color: #333333; font-size: 14px; line-height: 1.6;">${eventDescription}</p>
			` : ''}
		</div>
		
		${eventUrl ? `
			<div style="text-align: center; margin: 24px 0;">
				<a href="${eventUrl}" style="display: inline-block; background-color: #ec3750; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 6px;">
					View Event Details
				</a>
			</div>
		` : ''}
		
		<p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.5;">
			We hope to see you there! 🎉
		</p>
	`;
	
	const html = getEmailTemplate({
		title: '🗓️ New Event',
		content,
		preheader: `${eventTitle} - ${formattedDate || 'Date TBD'}`,
		footerText: `You're receiving this because you're a member of ${clubName}.`
	});
	
	try {
		await transporter.sendMail({
			from: `"${clubName} via Hack Club" <${env.SMTP_FROM || env.SMTP_USER}>`,
			to: recipientEmail,
			subject: `[${clubName}] New Event: ${eventTitle}`,
			text: `New event from ${clubName}!\n\n${eventTitle}\n\n${formattedDate ? `When: ${formattedDate}\n` : ''}${eventLocation ? `Where: ${eventLocation}\n` : ''}\n${eventDescription || ''}\n\nWe hope to see you there!`,
			html
		});
		
		console.log(`Sent event notification to ${recipientEmail}`);
		return true;
	} catch (error) {
		console.error('Error sending event notification:', error);
		return false;
	}
}

export async function sendEventReminder({ recipientEmail, recipientName, clubName, eventTitle, eventDate, eventLocation, eventUrl, reminderType = '24h' }) {
	const transporter = getTransporter();
	
	const formattedDate = eventDate ? new Date(eventDate).toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	}) : null;
	
	const reminderText = reminderType === '1h' ? 'starting in 1 hour' : 'happening tomorrow';
	
	const content = `
		<p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
			${recipientName ? `Hey ${recipientName}! ` : ''}Just a friendly reminder that <strong style="color: #ec3750;">${eventTitle}</strong> is ${reminderText}!
		</p>
		
		<div style="background-color: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
			<h2 style="margin: 0 0 12px; color: #333333; font-size: 18px; font-weight: 600;">⏰ ${eventTitle}</h2>
			
			${formattedDate ? `
				<p style="margin: 0 0 8px; color: #666666; font-size: 14px;">
					📅 <strong>${formattedDate}</strong>
				</p>
			` : ''}
			
			${eventLocation ? `
				<p style="margin: 0; color: #666666; font-size: 14px;">
					📍 ${eventLocation}
				</p>
			` : ''}
		</div>
		
		${eventUrl ? `
			<div style="text-align: center; margin: 24px 0;">
				<a href="${eventUrl}" style="display: inline-block; background-color: #ec3750; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 6px;">
					View Event
				</a>
			</div>
		` : ''}
		
		<p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.5;">
			See you soon! 👋
		</p>
	`;
	
	const html = getEmailTemplate({
		title: '⏰ Event Reminder',
		content,
		preheader: `${eventTitle} is ${reminderText}!`,
		footerText: `You're receiving this because you're a member of ${clubName}.`
	});
	
	try {
		await transporter.sendMail({
			from: `"${clubName} via Hack Club" <${env.SMTP_FROM || env.SMTP_USER}>`,
			to: recipientEmail,
			subject: `Reminder: ${eventTitle} is ${reminderText}!`,
			text: `Reminder: ${eventTitle} is ${reminderText}!\n\n${formattedDate ? `When: ${formattedDate}\n` : ''}${eventLocation ? `Where: ${eventLocation}\n` : ''}\n\nSee you soon!`,
			html
		});
		
		console.log(`Sent event reminder to ${recipientEmail}`);
		return true;
	} catch (error) {
		console.error('Error sending event reminder:', error);
		return false;
	}
}

export async function sendWelcomeEmail({ recipientEmail, recipientName, clubName, joinCode }) {
	const transporter = getTransporter();
	
	const content = `
		<p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
			${recipientName ? `Hey ${recipientName}! ` : 'Hey there! '}Welcome to <strong style="color: #ec3750;">${clubName}</strong>! 🎉
		</p>
		
		<p style="margin: 0 0 24px; color: #666666; font-size: 15px; line-height: 1.6;">
			You've successfully joined the club. Your leaders will keep you updated about upcoming meetings, events, and announcements through email.
		</p>
		
		<div style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
			<h3 style="margin: 0 0 12px; color: #166534; font-size: 16px; font-weight: 600;">What's next?</h3>
			<ul style="margin: 0; padding: 0 0 0 20px; color: #333333; font-size: 14px; line-height: 1.8;">
				<li>Keep an eye on your inbox for event announcements</li>
				<li>Participate in club meetings and activities</li>
				<li>Connect with other members and have fun!</li>
			</ul>
		</div>
		
		<p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.5;">
			Happy hacking! 💻
		</p>
	`;
	
	const html = getEmailTemplate({
		title: 'Welcome to the Club! 🎉',
		content,
		preheader: `You've joined ${clubName}!`,
		footerText: `You're receiving this because you just joined ${clubName}.`
	});
	
	try {
		await transporter.sendMail({
			from: `"${clubName} via Hack Club" <${env.SMTP_FROM || env.SMTP_USER}>`,
			to: recipientEmail,
			subject: `Welcome to ${clubName}! 🎉`,
			text: `${recipientName ? `Hey ${recipientName}! ` : 'Hey there! '}Welcome to ${clubName}!\n\nYou've successfully joined the club. Your leaders will keep you updated about upcoming meetings, events, and announcements through email.\n\nHappy hacking!`,
			html
		});
		
		console.log(`Sent welcome email to ${recipientEmail}`);
		return true;
	} catch (error) {
		console.error('Error sending welcome email:', error);
		return false;
	}
}

// Bulk send helper for announcements/events to multiple recipients
export async function sendBulkEmail(recipients, emailFn, emailData) {
	const results = { sent: 0, failed: 0, errors: [] };
	
	for (const recipient of recipients) {
		try {
			await emailFn({
				recipientEmail: recipient.email,
				recipientName: recipient.name,
				...emailData
			});
			results.sent++;
		} catch (error) {
			results.failed++;
			results.errors.push({ email: recipient.email, error: error.message });
		}
		
		// Small delay to avoid rate limiting
		await new Promise(resolve => setTimeout(resolve, 100));
	}
	
	console.log(`Bulk email complete: ${results.sent} sent, ${results.failed} failed`);
	return results;
}

export async function sendMemberInvitation({ recipientEmail, recipientName, clubName, inviterName, joinCode }) {
	const transporter = getTransporter();
	
	const joinUrl = joinCode ? `https://hack.club/join/${joinCode}` : 'https://leaders.hackclub.com';
	
	const content = `
		<p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
			${recipientName ? `Hey ${recipientName}! ` : 'Hey there! '}<strong>${inviterName}</strong> has added you to <strong style="color: #ec3750;">${clubName}</strong> on Hack Club!
		</p>
		
		<p style="margin: 0 0 24px; color: #666666; font-size: 15px; line-height: 1.6;">
			Hack Club is a global network of student-led coding clubs. As a member, you'll get updates about meetings, events, and announcements from your club leaders.
		</p>
		
		<div style="background-color: #fafafa; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center;">
			<p style="margin: 0 0 16px; color: #666666; font-size: 14px;">
				Create a free Hack Club account to access member features:
			</p>
			<a href="${joinUrl}" style="display: inline-block; background-color: #ec3750; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
				Join ${clubName}
			</a>
		</div>
		
		<p style="margin: 0; color: #999999; font-size: 13px; text-align: center;">
			Or copy this link: <span style="color: #338eda;">${joinUrl}</span>
		</p>
	`;
	
	const html = getEmailTemplate({
		title: "You've Been Invited! 🎉",
		content,
		preheader: `${inviterName} added you to ${clubName}`,
		footerText: `You're receiving this because ${inviterName} added you to ${clubName}.`
	});
	
	try {
		await transporter.sendMail({
			from: `"${clubName} via Hack Club" <${env.SMTP_FROM || env.SMTP_USER}>`,
			to: recipientEmail,
			subject: `You've been added to ${clubName}!`,
			text: `${recipientName ? `Hey ${recipientName}! ` : 'Hey there! '}${inviterName} has added you to ${clubName} on Hack Club!\n\nJoin your club: ${joinUrl}\n\nHack Club is a global network of student-led coding clubs. As a member, you'll get updates about meetings, events, and announcements from your club leaders.`,
			html
		});
		
		console.log(`Sent member invitation email to ${recipientEmail} for ${clubName}`);
		return true;
	} catch (error) {
		console.error('Error sending member invitation email:', error);
		return false;
	}
}

export async function sendPromotionEmail({ recipientEmail, recipientName, clubName, promoterName }) {
	const transporter = getTransporter();
	
	const content = `
		<p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
			${recipientName ? `Hey ${recipientName}! ` : 'Hey there! '}Great news — <strong>${promoterName}</strong> has promoted you to <strong style="color: #ec3750;">co-leader</strong> of <strong style="color: #ec3750;">${clubName}</strong>! 🎉
		</p>
		
		<p style="margin: 0 0 24px; color: #666666; font-size: 15px; line-height: 1.6;">
			As a co-leader, you now have full access to manage the club through the Leaders Portal:
		</p>
		
		<div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
			<ul style="margin: 0; padding: 0 0 0 20px; color: #333333; font-size: 14px; line-height: 1.8;">
				<li>Send announcements to all members</li>
				<li>Create and manage events</li>
				<li>Add and remove club members</li>
				<li>Access club analytics and tools</li>
				<li>Invite other co-leaders</li>
			</ul>
		</div>
		
		<div style="text-align: center; margin: 32px 0;">
			<a href="https://leaders.hackclub.com/my-club" style="display: inline-block; background-color: #ec3750; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
				Open Leaders Portal
			</a>
		</div>
		
		<p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.5;">
			Welcome to the leadership team! 🚀
		</p>
	`;
	
	const html = getEmailTemplate({
		title: "You're Now a Co-Leader! 🎉",
		content,
		preheader: `You've been promoted to co-leader of ${clubName}`,
		footerText: `You're receiving this because you were promoted to co-leader of ${clubName}.`
	});
	
	try {
		await transporter.sendMail({
			from: `"Hack Club" <${env.SMTP_FROM || env.SMTP_USER}>`,
			to: recipientEmail,
			subject: `You're now a co-leader of ${clubName}! 🎉`,
			text: `${recipientName ? `Hey ${recipientName}! ` : 'Hey there! '}Great news — ${promoterName} has promoted you to co-leader of ${clubName}!\n\nAs a co-leader, you now have full access to manage the club through the Leaders Portal.\n\nVisit: https://leaders.hackclub.com/my-club\n\nWelcome to the leadership team!`,
			html
		});
		
		console.log(`Sent promotion email to ${recipientEmail} for ${clubName}`);
		return true;
	} catch (error) {
		console.error('Error sending promotion email:', error);
		return false;
	}
}


