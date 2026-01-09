<script>
    let { data } = $props();
    let searchQuery = $state('');
    let selectedYsws = $state('all');
    let selectedClub = $state('all');

    let filteredShips = $derived(() => {
        let ships = data.allShips;
        
        if (selectedYsws !== 'all') {
            ships = ships.filter(s => s.ysws === selectedYsws);
        }
        
        if (selectedClub !== 'all') {
            ships = ships.filter(s => s.clubName === selectedClub);
        }
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            ships = ships.filter(s => 
                s.ysws.toLowerCase().includes(query) ||
                s.memberName.toLowerCase().includes(query) ||
                s.clubName.toLowerCase().includes(query)
            );
        }
        
        return ships;
    });

    let uniqueYsws = $derived(() => {
        return [...new Set(data.allShips.map(s => s.ysws))].sort();
    });

    let uniqueClubs = $derived(() => {
        return [...new Set(data.allShips.map(s => s.clubName))].sort();
    });
</script>

<div class="analytics-page">
    <div class="header">
        <a href="/admin/analytics" class="back-link">← Back to Analytics</a>
        <h1>Ship Analytics</h1>
    </div>

    <div class="stats-row">
        <div class="stat-card">
            <span class="stat-label">Total Ships</span>
            <span class="stat-value">{data.totalShips}</span>
        </div>
        <div class="stat-card">
            <span class="stat-label">YSWS Programs</span>
            <span class="stat-value">{data.uniqueYsws}</span>
        </div>
        <div class="stat-card">
            <span class="stat-label">Clubs with Ships</span>
            <span class="stat-value">{data.uniqueClubs}</span>
        </div>
        <div class="stat-card">
            <span class="stat-label">Unique Shippers</span>
            <span class="stat-value">{data.uniqueMembers}</span>
        </div>
    </div>

    <div class="grid-layout">
        <section class="panel">
            <h2>By YSWS Program</h2>
            <div class="list-container">
                {#if data.topYsws.length === 0}
                    <p class="empty-state">No ships found.</p>
                {:else}
                    {#each data.topYsws as ysws}
                        <div class="list-item">
                            <span class="item-title">{ysws.name}</span>
                            <span class="badge orange">{ysws.count}</span>
                        </div>
                    {/each}
                {/if}
            </div>
        </section>

        <section class="panel">
            <h2>By Club</h2>
            <div class="list-container">
                {#if data.topClubs.length === 0}
                    <p class="empty-state">No ships found.</p>
                {:else}
                    {#each data.topClubs as club}
                        <div class="list-item">
                            <span class="item-title">{club.name}</span>
                            <span class="badge blue">{club.count}</span>
                        </div>
                    {/each}
                {/if}
            </div>
        </section>

        <section class="panel">
            <h2>Top Shippers</h2>
            <div class="list-container">
                {#if data.topMembers.length === 0}
                    <p class="empty-state">No shippers found.</p>
                {:else}
                    {#each data.topMembers as member}
                        <div class="list-item">
                            <span class="item-title">{member.name}</span>
                            <span class="badge green">{member.count} ships</span>
                        </div>
                    {/each}
                {/if}
            </div>
        </section>
    </div>

    <section class="panel full-width">
        <h2>All Ships</h2>
        <div class="filters">
            <input 
                type="text" 
                placeholder="Search ships..." 
                bind:value={searchQuery}
                class="search-input"
            />
            <select bind:value={selectedYsws} class="filter-select">
                <option value="all">All YSWS Programs</option>
                {#each uniqueYsws() as ysws}
                    <option value={ysws}>{ysws}</option>
                {/each}
            </select>
            <select bind:value={selectedClub} class="filter-select">
                <option value="all">All Clubs</option>
                {#each uniqueClubs() as club}
                    <option value={club}>{club}</option>
                {/each}
            </select>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>YSWS Program</th>
                        <th>Member</th>
                        <th>Club</th>
                        <th>Code</th>
                    </tr>
                </thead>
                <tbody>
                    {#if filteredShips().length === 0}
                        <tr>
                            <td colspan="4" class="empty-state">No ships found.</td>
                        </tr>
                    {:else}
                        {#each filteredShips() as ship}
                            <tr>
                                <td class="font-medium">{ship.ysws}</td>
                                <td>{ship.memberName}</td>
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
        <p class="count-label">Showing {filteredShips().length} of {data.allShips.length} ships</p>
    </section>
</div>

<style>
    .analytics-page {
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
    }

    .header {
        margin-bottom: 2rem;
    }

    .back-link {
        color: #338eda;
        text-decoration: none;
        font-size: 0.875rem;
    }

    .back-link:hover {
        text-decoration: underline;
    }

    h1 {
        font-size: 2rem;
        font-weight: 700;
        color: #1f2d3d;
        margin-top: 0.5rem;
    }

    h2 {
        font-size: 1.25rem;
        font-weight: 600;
        color: #1f2d3d;
        margin-bottom: 1rem;
    }

    .stats-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .stat-card {
        background: #fff;
        border: 2px solid #e0e6ed;
        border-radius: 12px;
        padding: 1.5rem;
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
        font-size: 2.5rem;
        font-weight: 700;
        color: #1f2d3d;
    }

    .grid-layout {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    @media (max-width: 1100px) {
        .grid-layout {
            grid-template-columns: 1fr;
        }
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

    .list-container {
        max-height: 400px;
        overflow-y: auto;
    }

    .list-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid #e0e6ed;
    }

    .list-item:last-child {
        border-bottom: none;
    }

    .item-title {
        font-weight: 500;
        color: #1f2d3d;
        font-size: 0.875rem;
    }

    .badge {
        padding: 0.25rem 0.5rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
    }

    .badge.orange {
        background: #ff8c37;
        color: white;
    }

    .badge.blue {
        background: #338eda;
        color: white;
    }

    .badge.green {
        background: #33d6a6;
        color: white;
    }

    .filters {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
        flex-wrap: wrap;
    }

    .search-input {
        flex: 1;
        min-width: 200px;
        padding: 0.5rem 0.75rem;
        border: 2px solid #e0e6ed;
        border-radius: 8px;
        font-size: 0.875rem;
    }

    .search-input:focus {
        outline: none;
        border-color: #338eda;
    }

    .filter-select {
        padding: 0.5rem 0.75rem;
        border: 2px solid #e0e6ed;
        border-radius: 8px;
        font-size: 0.875rem;
        background: white;
    }

    .table-container {
        max-height: 500px;
        overflow-y: auto;
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
        position: sticky;
        top: 0;
        background: white;
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

    .empty-state {
        text-align: center;
        color: #8492a6;
        padding: 1rem;
        font-style: italic;
    }

    .count-label {
        margin-top: 1rem;
        font-size: 0.875rem;
        color: #8492a6;
    }
</style>
