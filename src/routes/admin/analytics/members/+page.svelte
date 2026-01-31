<script>
    let { data } = $props();
    let searchQuery = $state('');
    let selectedClub = $state('all');

    let filteredMembers = $derived(() => {
        let members = data.allMembers;
        
        if (selectedClub !== 'all') {
            members = members.filter(m => m.clubName === selectedClub);
        }
        
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            members = members.filter(m => 
                m.name.toLowerCase().includes(query) ||
                (m.email && m.email.toLowerCase().includes(query)) ||
                m.clubName.toLowerCase().includes(query)
            );
        }
        
        return members;
    });

    let uniqueClubs = $derived(() => {
        return [...new Set(data.allMembers.map(m => m.clubName))].sort();
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
        <h1>Member Analytics</h1>
        <p class="header-subtitle">View member statistics and distribution across clubs</p>
    </div>

    <div class="stats-row">
        <div class="stat-card">
            <span class="stat-label">Total Members</span>
            <span class="stat-value">{data.totalMembers}</span>
        </div>
        <div class="stat-card">
            <span class="stat-label">Clubs with Members</span>
            <span class="stat-value">{data.clubsWithMembers}</span>
        </div>
        <div class="stat-card">
            <span class="stat-label">Avg Members/Club</span>
            <span class="stat-value">{data.avgMembersPerClub}</span>
        </div>
    </div>

    <div class="grid-layout">
        <section class="panel">
            <h2>Clubs by Member Count</h2>
            <div class="list-container">
                {#if data.topClubs.length === 0}
                    <p class="empty-state">No clubs found.</p>
                {:else}
                    {#each data.topClubs as club}
                        <div class="list-item">
                            <span class="item-title">{club.name}</span>
                            <span class="badge blue">{club.count} members</span>
                        </div>
                    {/each}
                {/if}
            </div>
        </section>

        <section class="panel">
            <h2>All Members</h2>
            <div class="filters">
                <input 
                    type="text" 
                    placeholder="Search members..." 
                    bind:value={searchQuery}
                    class="search-input"
                />
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
                            <th>Name</th>
                            <th>Email</th>
                            <th>Club</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#if filteredMembers().length === 0}
                            <tr>
                                <td colspan="3" class="empty-state">No members found.</td>
                            </tr>
                        {:else}
                            {#each filteredMembers() as member}
                                <tr>
                                    <td class="font-medium">{member.name}</td>
                                    <td>{member.email || '—'}</td>
                                    <td>{member.clubName}</td>
                                </tr>
                            {/each}
                        {/if}
                    </tbody>
                </table>
            </div>
            <p class="count-label">Showing {filteredMembers().length} of {data.allMembers.length} members</p>
        </section>
    </div>
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
        margin: 0 0 16px 0;
    }

    .stats-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
        grid-template-columns: 1fr 2fr;
        gap: 20px;
    }

    @media (max-width: 900px) {
        .analytics-page {
            padding: 20px;
        }

        .grid-layout {
            grid-template-columns: 1fr;
        }
    }

    .panel {
        background: #fff;
        border: 1px solid #e0e6ed;
        border-radius: 12px;
        padding: 20px;
    }

    .list-container {
        max-height: 500px;
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

    .item-title {
        font-weight: 600;
        color: #1f2d3d;
        font-size: 0.875rem;
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
