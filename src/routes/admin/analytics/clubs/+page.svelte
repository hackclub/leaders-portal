<script>
    let { data } = $props();
    let searchQuery = $state('');
    let sortBy = $state('members');

    let filteredClubs = $derived(() => {
        let clubs = data.allClubs;
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            clubs = clubs.filter(c => c.name.toLowerCase().includes(query));
        }
        
        if (sortBy === 'members') {
            clubs = [...clubs].sort((a, b) => b.members - a.members);
        } else if (sortBy === 'ships') {
            clubs = [...clubs].sort((a, b) => b.ships - a.ships);
        } else if (sortBy === 'ratio') {
            clubs = [...clubs].sort((a, b) => b.shipsPerMember - a.shipsPerMember);
        } else if (sortBy === 'name') {
            clubs = [...clubs].sort((a, b) => a.name.localeCompare(b.name));
        }
        
        return clubs;
    });
</script>

<div class="analytics-page">
    <div class="header">
        <a href="/admin/analytics" class="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5"></path>
                <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Analytics
        </a>
        <h1>Club Analytics</h1>
        <p class="header-subtitle">View club statistics and performance metrics</p>
    </div>

    <div class="stats-row">
        <div class="stat-card">
            <span class="stat-label">Total Clubs</span>
            <span class="stat-value">{data.totalClubs}</span>
        </div>
        <div class="stat-card">
            <span class="stat-label">Total Members</span>
            <span class="stat-value">{data.totalMembers}</span>
        </div>
        <div class="stat-card">
            <span class="stat-label">Total Ships</span>
            <span class="stat-value">{data.totalShips}</span>
        </div>
        <div class="stat-card">
            <span class="stat-label">Avg Members/Club</span>
            <span class="stat-value">{data.avgMembersPerClub}</span>
        </div>
        <div class="stat-card">
            <span class="stat-label">Clubs with Ships</span>
            <span class="stat-value">{data.clubsWithShips}</span>
        </div>
    </div>

    <div class="grid-layout">
        <section class="panel">
            <h2>Top Clubs by Members</h2>
            <div class="list-container">
                {#if data.topByMembers.length === 0}
                    <p class="empty-state">No clubs found.</p>
                {:else}
                    {#each data.topByMembers as club}
                        <div class="list-item">
                            <span class="item-title">{club.name}</span>
                            <span class="badge blue">{club.members}</span>
                        </div>
                    {/each}
                {/if}
            </div>
        </section>

        <section class="panel">
            <h2>Top Clubs by Ships</h2>
            <div class="list-container">
                {#if data.topByShips.length === 0}
                    <p class="empty-state">No ships found.</p>
                {:else}
                    {#each data.topByShips as club}
                        <div class="list-item">
                            <span class="item-title">{club.name}</span>
                            <span class="badge orange">{club.ships}</span>
                        </div>
                    {/each}
                {/if}
            </div>
        </section>

        <section class="panel">
            <h2>Best Ships/Member Ratio</h2>
            <p class="subtitle">Clubs with 3+ members</p>
            <div class="list-container">
                {#if data.topByRatio.length === 0}
                    <p class="empty-state">No qualifying clubs.</p>
                {:else}
                    {#each data.topByRatio as club}
                        <div class="list-item">
                            <div class="item-info">
                                <span class="item-title">{club.name}</span>
                                <span class="item-subtitle">{club.members} members, {club.ships} ships</span>
                            </div>
                            <span class="badge green">{club.shipsPerMember}</span>
                        </div>
                    {/each}
                {/if}
            </div>
        </section>
    </div>

    <section class="panel full-width">
        <h2>All Clubs</h2>
        <div class="filters">
            <input 
                type="text" 
                placeholder="Search clubs..." 
                bind:value={searchQuery}
                class="search-input"
            />
            <select bind:value={sortBy} class="filter-select">
                <option value="members">Sort by Members</option>
                <option value="ships">Sort by Ships</option>
                <option value="ratio">Sort by Ships/Member</option>
                <option value="name">Sort by Name</option>
            </select>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Club Name</th>
                        <th>Members</th>
                        <th>Ships</th>
                        <th>Ships/Member</th>
                    </tr>
                </thead>
                <tbody>
                    {#if filteredClubs().length === 0}
                        <tr>
                            <td colspan="4" class="empty-state">No clubs found.</td>
                        </tr>
                    {:else}
                        {#each filteredClubs() as club}
                            <tr>
                                <td class="font-medium">{club.name}</td>
                                <td>{club.members}</td>
                                <td>{club.ships}</td>
                                <td>{club.shipsPerMember}</td>
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
        </div>
        <p class="count-label">Showing {filteredClubs().length} of {data.allClubs.length} clubs</p>
    </section>
</div>

<style>
    .analytics-page {
        max-width: 1400px;
        margin: 0 auto;
        padding: 32px;
    }

    .header {
        margin-bottom: 24px;
    }

    .back-link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: #338eda;
        text-decoration: none;
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 8px;
    }

    .back-link:hover {
        text-decoration: underline;
    }

    h1 {
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

    h2 {
        font-size: 1rem;
        font-weight: 700;
        color: #1f2d3d;
        margin: 0 0 8px 0;
    }

    .subtitle {
        font-size: 0.75rem;
        color: #8492a6;
        margin: 0 0 16px 0;
    }

    .stats-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
    }

    .stat-card {
        background: #fff;
        border: 1px solid #e0e6ed;
        border-radius: 12px;
        padding: 20px;
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
        font-size: 2rem;
        font-weight: 700;
        color: #1f2d3d;
    }

    .grid-layout {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin-bottom: 24px;
    }

    @media (max-width: 1100px) {
        .grid-layout {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 900px) {
        .analytics-page {
            padding: 20px;
        }
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

    .list-container {
        max-height: 350px;
        overflow-y: auto;
    }

    .list-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
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

    .badge.blue {
        background: #338eda;
        color: white;
    }

    .badge.orange {
        background: #ff8c37;
        color: white;
    }

    .badge.green {
        background: #33d6a6;
        color: white;
    }

    .filters {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
    }

    .search-input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid #e0e6ed;
        border-radius: 8px;
        font-size: 0.875rem;
        font-family: inherit;
        transition: all 150ms ease;
    }

    .search-input:focus {
        outline: none;
        border-color: #338eda;
        box-shadow: 0 0 0 3px rgba(51, 142, 218, 0.1);
    }

    .filter-select {
        padding: 10px 14px;
        border: 1px solid #e0e6ed;
        border-radius: 8px;
        font-size: 0.875rem;
        font-family: inherit;
        background: white;
        cursor: pointer;
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
        padding: 12px;
        font-size: 0.7rem;
        font-weight: 600;
        color: #8492a6;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 1px solid #e0e6ed;
        position: sticky;
        top: 0;
        background: white;
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

    .empty-state {
        text-align: center;
        color: #8492a6;
        padding: 24px;
        font-style: italic;
    }

    .count-label {
        margin-top: 16px;
        font-size: 0.8rem;
        color: #8492a6;
    }
</style>
