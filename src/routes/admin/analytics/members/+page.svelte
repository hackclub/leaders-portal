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
        <a href="/admin/analytics" class="back-link">← Back to Analytics</a>
        <h1>Member Analytics</h1>
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
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
        grid-template-columns: 1fr 2fr;
        gap: 1.5rem;
    }

    @media (max-width: 900px) {
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

    .list-container {
        max-height: 500px;
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

    .item-title {
        font-weight: 500;
        color: #1f2d3d;
    }

    .badge {
        padding: 0.25rem 0.5rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
    }

    .badge.blue {
        background: #338eda;
        color: white;
    }

    .filters {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .search-input {
        flex: 1;
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
