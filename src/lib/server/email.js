import { getAirtableBase } from './airtable.js';

// OTPs are sent via the same Airtable base used for homepage events, in the
// "Leader OTP" table.
const OTP_BASE_ID = 'appmmb6l3gwtDXwhT';
const OTP_TABLE = 'Leader OTP';

export async function sendOTPEmail(email, code) {
	const base = getAirtableBase(OTP_BASE_ID);
	
	try {
		await base(OTP_TABLE).create({
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


