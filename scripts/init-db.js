import knex from 'knex';
import knexConfig from '../knexfile.js';

async function initializeDatabase() {
	console.log('Initializing database...');

	const db = knex(knexConfig);

	try {
		const hasUsersTable = await db.schema.hasTable('users');

		if (!hasUsersTable) {
			console.log('Database is empty. Running migrations...');
			await db.migrate.latest();
			console.log('✓ Migrations complete!');
		} else {
			console.log('Database already initialized. Checking for pending migrations...');
			const [batch, migrations] = await db.migrate.list();
			const pending = migrations[1];

			if (pending && pending.length > 0) {
				console.log(`Found ${pending.length} pending migration(s). Running...`);
				await db.migrate.latest();
				console.log('✓ Migrations complete!');
			} else {
				console.log('✓ Database is up to date.');
			}
		}

		console.log('\nDatabase structure:');
		const tables = ['users', 'sessions', 'oauth_tokens'];
		for (const table of tables) {
			const exists = await db.schema.hasTable(table);
			console.log(`  ${exists ? '✓' : '✗'} ${table}`);
		}
	} catch (error) {
		console.error('Error initializing database:', error);
		process.exit(1);
	} finally {
		await db.destroy();
	}
}

initializeDatabase();
