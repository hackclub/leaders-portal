<script>
    let { data } = $props();
</script>

<div class="analytics-page">
    <div class="page-header">
        <div class="header-content">
            <h1>Analytics</h1>
            <p class="header-subtitle">View insights and statistics about clubs and members</p>
        </div>
    </div>

    <div class="nav-links">
        <a href="/admin/analytics/members" class="nav-link">
            <span class="nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            </span>
            <span class="nav-text">Member Analytics</span>
        </a>
        <a href="/admin/analytics/ships" class="nav-link">
            <span class="nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                    <line x1="4" y1="22" x2="4" y2="15"></line>
                </svg>
            </span>
            <span class="nav-text">Ship Analytics</span>
        </a>
        <a href="/admin/analytics/clubs" class="nav-link">
            <span class="nav-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
            </span>
            <span class="nav-text">Club Analytics</span>
        </a>
    </div>

    <div class="grid-layout">
        <section class="panel">
            <div class="panel-header">
                <span class="panel-icon events">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                </span>
                <h2>Most Completed Events</h2>
            </div>
            <div class="list-container">
                {#if data.eventStats.length === 0}
                    <p class="empty-state">No events completed yet.</p>
                {:else}
                    {#each data.eventStats as event}
                        <div class="list-item">
                            <div class="item-info">
                                <span class="item-title">{event.title}</span>
                                <span class="item-subtitle">{event.category}</span>
                            </div>
                            <span class="badge green">{event.count} completions</span>
                        </div>
                    {/each}
                {/if}
            </div>
        </section>

        <section class="panel">
            <div class="panel-header">
                <span class="panel-icon ships">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                        <line x1="4" y1="22" x2="4" y2="15"></line>
                    </svg>
                </span>
                <h2>Ship Analytics</h2>
            </div>
            
            <div class="stats-row">
                <div class="stat-card">
                    <span class="stat-label">Total Ships</span>
                    <span class="stat-value">{data.shipStats.totalShips}</span>
                </div>
                <div class="stat-card">
                    <span class="stat-label">Clubs with Ships</span>
                    <span class="stat-value">{data.shipStats.clubCount}</span>
                </div>
            </div>

            <h3>Top YSWS Programs</h3>
            <div class="list-container">
                {#each data.shipStats.topYsws as ysws}
                    <div class="list-item">
                        <span class="item-title">{ysws.name}</span>
                        <span class="badge orange">{ysws.count} ships</span>
                    </div>
                {/each}
                {#if data.shipStats.topYsws.length === 0}
                    <p class="empty-state">No ships found.</p>
                {/if}
            </div>

            <h3>Top Clubs by Ships</h3>
            <div class="list-container">
                {#each data.shipStats.topClubs as club}
                    <div class="list-item">
                        <span class="item-title">{club.name}</span>
                        <span class="badge blue">{club.count} ships</span>
                    </div>
                {/each}
                {#if data.shipStats.topClubs.length === 0}
                    <p class="empty-state">No ships found.</p>
                {/if}
            </div>
        </section>
    </div>

    <section class="panel full-width">
        <div class="panel-header">
            <span class="panel-icon recent">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
            </span>
            <h2>Recent Ships</h2>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Project</th>
                        <th>Member</th>
                        <th>Club</th>
                        <th>Code</th>
                    </tr>
                </thead>
                <tbody>
                    {#if data.shipStats.sampleShips.length === 0}
                        <tr>
                            <td colspan="4" class="empty-state">No ships found.</td>
                        </tr>
                    {:else}
                        {#each data.shipStats.sampleShips as ship}
                            <tr>
                                <td class="font-medium">{ship.name}</td>
                                <td>{ship.memberName || 'Unknown'}</td>
                                <td>{ship.clubName}</td>
                                <td>
                                    {#if ship.codeUrl}
                                        <a href={ship.codeUrl} target="_blank" rel="noopener noreferrer" class="code-link">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                                <polyline points="15 3 21 3 21 9"></polyline>
                                                <line x1="10" y1="14" x2="21" y2="3"></line>
                                            </svg>
                                            View Code
                                        </a>
                                    {:else}
                                        <span class="muted">No link</span>
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
        </div>
    </section>
</div>

<style>
    .analytics-page {
        max-width: 1400px;
        margin: 0 auto;
        padding: 32px;
    }

    .page-header {
        margin-bottom: 24px;
    }

    .header-content h1 {
        font-size: 1.75rem;
        font-weight: 700;
        color: #1f2d3d;
        margin: 0 0 4px 0;
    }

    .header-subtitle {
        font-size: 0.9rem;
        color: #8492a6;
        margin: 0;
    }

    .nav-links {
        display: flex;
        gap: 12px;
        margin-bottom: 24px;
        flex-wrap: wrap;
    }

    .nav-link {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 20px;
        background: #fff;
        border: 1px solid #e0e6ed;
        border-radius: 10px;
        text-decoration: none;
        color: #1f2d3d;
        font-weight: 600;
        font-size: 0.875rem;
        transition: all 150ms ease;
    }

    .nav-link:hover {
        border-color: #338eda;
        background: #f9fafc;
    }

    .nav-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #338eda;
    }

    .panel-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
    }

    .panel-header h2 {
        font-size: 1rem;
        font-weight: 700;
        color: #1f2d3d;
        margin: 0;
    }

    .panel-icon {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .panel-icon.events {
        background: #fee2e6;
        color: #ec3750;
    }

    .panel-icon.ships {
        background: #e8f0fe;
        color: #338eda;
    }

    .panel-icon.recent {
        background: #d1fae5;
        color: #33d6a6;
    }

    h3 {
        font-size: 0.875rem;
        font-weight: 600;
        color: #1f2d3d;
        margin: 20px 0 12px;
    }

    .grid-layout {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 20px;
        margin-bottom: 24px;
    }

    .panel {
        background: #fff;
        border: 1px solid #e0e6ed;
        border-radius: 12px;
        padding: 20px;
    }

    .panel.full-width {
        margin-top: 0;
    }

    .stats-row {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        margin-bottom: 16px;
    }

    .stat-card {
        background: #f9fafc;
        border: 1px solid #e0e6ed;
        border-radius: 10px;
        padding: 16px;
        text-align: center;
    }

    .stat-label {
        display: block;
        font-size: 0.75rem;
        font-weight: 500;
        color: #8492a6;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        margin-bottom: 4px;
    }

    .stat-value {
        display: block;
        font-size: 1.75rem;
        font-weight: 700;
        color: #1f2d3d;
    }

    .list-container {
        max-height: 400px;
        overflow-y: auto;
    }

    .list-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f0f4f8;
    }

    .list-item:last-child {
        border-bottom: none;
    }

    .item-info {
        display: flex;
        flex-direction: column;
    }

    .item-title {
        font-weight: 600;
        color: #1f2d3d;
        font-size: 0.875rem;
    }

    .item-subtitle {
        font-size: 0.75rem;
        color: #8492a6;
    }

    .badge {
        display: inline-flex;
        align-items: center;
        padding: 4px 10px;
        border-radius: 100px;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.03em;
    }

    .badge.green {
        background: #33d6a6;
        color: white;
    }

    .badge.orange {
        background: #ff8c37;
        color: white;
    }

    .badge.blue {
        background: #338eda;
        color: white;
    }

    .empty-state {
        text-align: center;
        color: #8492a6;
        padding: 24px;
        font-style: italic;
    }

    .table-container {
        overflow-x: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th {
        text-align: left;
        padding: 12px;
        font-size: 0.7rem;
        font-weight: 600;
        color: #8492a6;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 1px solid #e0e6ed;
    }

    td {
        padding: 12px;
        border-bottom: 1px solid #f0f4f8;
        color: #1f2d3d;
        font-size: 0.875rem;
    }

    tr:hover td {
        background: #f9fafc;
    }

    td.font-medium {
        font-weight: 600;
    }

    .code-link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: #338eda;
        text-decoration: none;
        font-weight: 500;
        font-size: 0.8rem;
    }

    .code-link:hover {
        text-decoration: underline;
    }

    .muted {
        color: #8492a6;
    }

    @media (max-width: 900px) {
        .analytics-page {
            padding: 20px;
        }

        .grid-layout {
            grid-template-columns: 1fr;
        }

        .nav-links {
            flex-direction: column;
        }
    }
</style>
