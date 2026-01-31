import Airtable from 'airtable';
import { env } from '$env/dynamic/private';

function getAirtableBase() {
	if (!env.AIRTABLE_API_KEY) {
		throw new Error("Missing AIRTABLE_API_KEY");
	}
	if (!env.AIRTABLE_BASE_ID) {
		throw new Error("Missing AIRTABLE_BASE_ID");
	}
	return new Airtable({ apiKey: env.AIRTABLE_API_KEY }).base(env.AIRTABLE_BASE_ID);
}

export async function sendOTPEmail(email, code) {
	const base = getAirtableBase();
	
	try {
		await base('Leader Emails').create({
			email: email,
			otp: code
		});
		
		console.log(`Created OTP record in Airtable for ${email}`);
		return true;
	} catch (error) {
		console.error('Error creating OTP record in Airtable:', error);
		throw new Error("Failed to create OTP record");
	}
}

export async function sendCoLeaderInvitation({ inviteeEmail, clubName, inviterName, message, invitationId }) {
	const base = getAirtableBase();
	
	try {
		await base('CoLeader Invitations').create({
			'Invitee Email': inviteeEmail,
			'Club Name': clubName,
			'Inviter Name': inviterName,
			'Personal Message': message || '',
			'Invitation ID': invitationId?.toString() || '',
			'Status': 'pending'
		});
		
		console.log(`Created co-leader invitation record in Airtable for ${inviteeEmail} to join ${clubName}`);
		return true;
	} catch (error) {
		console.error('Error creating co-leader invitation record in Airtable:', error);
		console.warn('Email automation may not trigger, but invitation was stored');
		return false;
	}
}

export async function sendLeaveVerificationEmail(email, code, memberName, clubName) {
	const base = getAirtableBase();
	
	try {
		await base('Leave Verifications').create({
			'Email': email,
			'Code': code,
			'Member Name': memberName,
			'Club Name': clubName
		});
		
		return true;
	} catch (error) {
		console.error('Error creating leave verification record in Airtable:', error);
		try {
			await base('Leader Emails').create({
				email: email,
				otp: code,
				type: 'leave_verification',
				club_name: clubName
			});
			return true;
		} catch (fallbackError) {
			console.error('Fallback email also failed:', fallbackError);
			throw new Error("Failed to send verification email");
		}
	}
}


