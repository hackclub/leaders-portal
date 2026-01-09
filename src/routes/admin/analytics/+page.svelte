<script>
    let { data } = $props();
</script>

<div class="analytics-page">
    <h1>Analytics</h1>

    <div class="nav-links">
        <a href="/admin/analytics/members" class="nav-link">
            <span class="nav-icon">👥</span>
            <span class="nav-text">Member Analytics</span>
        </a>
        <a href="/admin/analytics/ships" class="nav-link">
            <span class="nav-icon">🚀</span>
            <span class="nav-text">Ship Analytics</span>
        </a>
        <a href="/admin/analytics/clubs" class="nav-link">
            <span class="nav-icon">🏫</span>
            <span class="nav-text">Club Analytics</span>
        </a>
    </div>

    <div class="grid-layout">
        <section class="panel">
            <h2>Most Completed Events</h2>
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
            <h2>Ship Analytics</h2>
            
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
        <h2>Recent Ships</h2>
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
                                        <a href={ship.codeUrl} target="_blank" rel="noopener noreferrer">View Code</a>
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
        padding: 2rem;
    }

    h1 {
        font-size: 2rem;
        font-weight: 700;
        color: #1f2d3d;
        margin-bottom: 1.5rem;
    }

    .nav-links {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
    }

    .nav-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.25rem;
        background: #fff;
        border: 2px solid #e0e6ed;
        border-radius: 8px;
        text-decoration: none;
        color: #1f2d3d;
        font-weight: 500;
        transition: border-color 0.15s;
    }

    .nav-link:hover {
        border-color: #338eda;
    }

    .nav-icon {
        font-size: 1.25rem;
    }

    .nav-text {
        font-size: 0.875rem;
    }

    h2 {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1f2d3d;
        margin-bottom: 1rem;
    }

    h3 {
        font-size: 1rem;
        font-weight: 600;
        color: #1f2d3d;
        margin: 1.5rem 0 0.75rem;
    }

    .grid-layout {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .panel {
        background: #fff;
        border: 2px solid #e0e6ed;
        border-radius: 12px;
        padding: 1.5rem;
    }

    .panel.full-width {
        margin-top: 1.5rem;
    }

    .stats-row {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .stat-card {
        background: #f9fafc;
        border: 2px solid #e0e6ed;
        border-radius: 8px;
        padding: 1rem;
        text-align: center;
    }

    .stat-label {
        display: block;
        font-size: 0.875rem;
        color: #8492a6;
        margin-bottom: 0.25rem;
    }

    .stat-value {
        display: block;
        font-size: 2rem;
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
        padding: 0.75rem 0;
        border-bottom: 1px solid #e0e6ed;
    }

    .list-item:last-child {
        border-bottom: none;
    }

    .item-info {
        display: flex;
        flex-direction: column;
    }

    .item-title {
        font-weight: 500;
        color: #1f2d3d;
    }

    .item-subtitle {
        font-size: 0.75rem;
        color: #8492a6;
    }

    .badge {
        padding: 0.25rem 0.5rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
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
        padding: 1rem;
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
        padding: 0.75rem;
        font-size: 0.75rem;
        font-weight: 500;
        color: #8492a6;
        text-transform: uppercase;
        border-bottom: 2px solid #e0e6ed;
    }

    td {
        padding: 0.75rem;
        border-bottom: 1px solid #e0e6ed;
        color: #1f2d3d;
    }

    td.font-medium {
        font-weight: 500;
    }

    td a {
        color: #338eda;
        text-decoration: none;
    }

    td a:hover {
        text-decoration: underline;
    }

    .muted {
        color: #8492a6;
    }
</style>
