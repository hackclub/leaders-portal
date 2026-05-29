import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getClubShips, getClubLevel } from '../src/lib/server/clubapi.js';

describe('clubapi', () => {
	let fetchMock;

	beforeEach(() => {
		fetchMock = vi.fn();
		global.fetch = fetchMock;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('getClubShips returns empty array and does not throw when API returns empty string', async () => {
		fetchMock.mockResolvedValue({
			ok: true,
			status: 200,
			statusText: 'OK',
			text: async () => ''
		});

		const ships = await getClubShips('Meow Mrrp Club');
		expect(ships).toEqual([]);
	});

	it('getClubShips returns empty array and does not throw when API returns spaces', async () => {
		fetchMock.mockResolvedValue({
			ok: true,
			status: 200,
			statusText: 'OK',
			text: async () => '   '
		});

		const ships = await getClubShips('Meow Mrrp Club');
		expect(ships).toEqual([]);
	});

	it('getClubShips returns parsed ships when API returns valid JSON array', async () => {
		const mockShips = [
			{
				fields: {
					ysws: 'Slack Clone',
					code_url: 'https://github.com/user/slack-clone',
					email: 'member@hackclub.com'
				}
			}
		];
		fetchMock.mockResolvedValue({
			ok: true,
			status: 200,
			statusText: 'OK',
			text: async () => JSON.stringify(mockShips)
		});

		const ships = await getClubShips('Meow Mrrp Club');
		expect(ships).toEqual([
			{
				ysws: 'Slack Clone',
				codeUrl: 'https://github.com/user/slack-clone',
				email: 'member@hackclub.com'
			}
		]);
	});

	it('getClubLevel returns null and does not throw when API returns empty response', async () => {
		fetchMock.mockResolvedValue({
			ok: true,
			status: 200,
			statusText: 'OK',
			text: async () => ''
		});

		const level = await getClubLevel('Meow Mrrp Club');
		expect(level).toBeNull();
	});
});
