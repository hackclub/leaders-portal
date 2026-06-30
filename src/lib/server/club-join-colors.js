import { getKnex } from './db/knex.js';

export const DEFAULT_JOIN_COLORS = {
	bgColor: '#f9fafc',
	cardColor: '#ffffff',
	textColor: '#1f2d3d',
	buttonColor: '#ec3750'
};

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

export function sanitizeHexColor(value, fallback) {
	if (typeof value === 'string' && HEX_COLOR_REGEX.test(value.trim())) {
		return value.trim().toLowerCase();
	}
	return fallback;
}

export async function getJoinPageColors(clubName) {
	const knex = getKnex();
	const row = await knex('club_join_page_colors').where({ club_name: clubName }).first();

	if (!row) {
		return { ...DEFAULT_JOIN_COLORS };
	}

	return {
		bgColor: row.bg_color || DEFAULT_JOIN_COLORS.bgColor,
		cardColor: row.card_color || DEFAULT_JOIN_COLORS.cardColor,
		textColor: row.text_color || DEFAULT_JOIN_COLORS.textColor,
		buttonColor: row.button_color || DEFAULT_JOIN_COLORS.buttonColor
	};
}

export async function updateJoinPageColors(clubName, colors) {
	const knex = getKnex();
	const now = new Date();

	const sanitized = {
		bg_color: sanitizeHexColor(colors.bgColor, DEFAULT_JOIN_COLORS.bgColor),
		card_color: sanitizeHexColor(colors.cardColor, DEFAULT_JOIN_COLORS.cardColor),
		text_color: sanitizeHexColor(colors.textColor, DEFAULT_JOIN_COLORS.textColor),
		button_color: sanitizeHexColor(colors.buttonColor, DEFAULT_JOIN_COLORS.buttonColor)
	};

	await knex('club_join_page_colors')
		.insert({
			club_name: clubName,
			...sanitized,
			created_at: now,
			updated_at: now
		})
		.onConflict('club_name')
		.merge({ ...sanitized, updated_at: now });

	return {
		bgColor: sanitized.bg_color,
		cardColor: sanitized.card_color,
		textColor: sanitized.text_color,
		buttonColor: sanitized.button_color
	};
}
