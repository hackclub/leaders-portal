import knex from 'knex';
import { env } from '$env/dynamic/private';

let instance = null;

export function getKnex() {
	if (!instance) {
		instance = knex({
			client: 'pg',
			connection: env.DATABASE_URL
		});
	}
	return instance;
}

export async function closeKnex() {
	if (instance) {
		await instance.destroy();
		instance = null;
	}
}
