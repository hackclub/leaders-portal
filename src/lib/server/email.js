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


