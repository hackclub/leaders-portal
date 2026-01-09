<script>
    let { data, form } = $props();
    
    let searchQuery = $state('');
</script>

<div class="admin-page">
    <div class="page-header">
        <h1>Club Management</h1>
        <a href="/admin" class="btn-back">← Back to Dashboard</a>
    </div>

    <section class="stats-grid">
        <div class="stat-card">
            <div class="stat-header">
                <span class="stat-icon">🧑‍🤝‍🧑</span>
                <span class="stat-label">Total Clubs</span>
            </div>
            <div class="stat-value">{data.stats.totalClubs}</div>
        </div>

        <div class="stat-card">
            <div class="stat-header">
                <span class="stat-icon">👥</span>
                <span class="stat-label">Total Members</span>
            </div>
            <div class="stat-value">{data.stats.totalMembers}</div>
        </div>

        <div class="stat-card">
            <div class="stat-header">
                <span class="stat-icon">🚀</span>
                <span class="stat-label">Total Ships</span>
            </div>
            <div class="stat-value">{data.stats.totalShips}</div>
        </div>
    </section>

    <section class="search-section">
        <div class="search-panel">
            <h3>Search Clubs</h3>
            <form method="POST" action="?/search" class="search-form">
                <input 
                    type="text" 
                    name="query" 
                    placeholder="Search by club name..." 
                    bind:value={searchQuery}
                    required
                    minlength="2"
                />
                <button type="submit" class="btn-search">Search</button>
            </form>
            
            {#if form?.searchError}
                <p class="error">{form.searchError}</p>
            {/if}
        </div>
    </section>

    {#if form?.searchResults}
        <section class="results-section">
            <div class="section-header">
                <h2>Search Results</h2>
                <span class="results-count">{form.searchResults.length} results for "{form.searchQuery}"</span>
            </div>
            
            {#if form.searchResults.length > 0}
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Club</th>
                                <th>Members</th>
                                <th>Ships</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each form.searchResults as club}
                                <tr>
                                    <td>
                                        <div class="club-name">{club.name}</div>
                                    </td>
                                    <td>
                                        <span class="count-badge">{club.memberCount}</span>
                                    </td>
                                    <td>
                                        <span class="count-badge ships">{club.shipCount}</span>
                                    </td>
                                    <td class="actions">
                                        <a href="/admin/clubs/{encodeURIComponent(club.name)}" class="btn-small">View Details</a>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {:else}
                <p class="no-results">No clubs found matching your search.</p>
            {/if}
        </section>
    {/if}

    <section class="data-section">
        <div class="section-header">
            <h2>All Clubs</h2>
            <span class="total-count">{data.clubs.length} total clubs</span>
        </div>

        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Club</th>
                        <th>Members</th>
                        <th>Ships</th>
                        <th>Top YSWS Programs</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.clubs as club}
                        <tr>
                            <td>
                                <div class="club-name">{club.name}</div>
                            </td>
                            <td>
                                <span class="count-badge">{club.memberCount}</span>
                            </td>
                            <td>
                                <span class="count-badge ships">{club.shipCount}</span>
                            </td>
                            <td>
                                {#if club.topYsws && club.topYsws.length > 0}
                                    <div class="ysws-list">
                                        {#each club.topYsws.slice(0, 3) as ysws}
                                            <span class="badge ysws">{ysws.name} ({ysws.count})</span>
                                        {/each}
                                    </div>
                                {:else}
                                    <span class="muted">No ships yet</span>
                                {/if}
                            </td>
                            <td class="actions">
                                <a href="/admin/clubs/{encodeURIComponent(club.name)}" class="btn-small">View Details</a>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </section>
</div>

<style>
    .admin-page {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
    }

    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }

    h1 {
        color: #1f2d3d;
        font-size: 1.75rem;
        margin: 0;
    }

    h2 {
        color: #1f2d3d;
        font-size: 1.25rem;
        margin: 0;
    }

    h3 {
        color: #1f2d3d;
        font-size: 1rem;
        margin: 0 0 1rem 0;
    }

    .btn-back {
        color: #338eda;
        text-decoration: none;
        font-size: 0.875rem;
    }

    .btn-back:hover {
        text-decoration: underline;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .stat-card {
        background: #fff;
        border: 2px solid #e0e6ed;
        border-radius: 12px;
        padding: 1.25rem;
    }

    .stat-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
    }

    .stat-icon {
        font-size: 1.25rem;
    }

    .stat-label {
        font-size: 0.875rem;
        color: #8492a6;
    }

    .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: #1f2d3d;
    }

    .search-section {
        margin-bottom: 2rem;
    }

    .search-panel {
        background: #fff;
        border: 2px solid #e0e6ed;
        border-radius: 12px;
        padding: 1.25rem;
    }

    .search-form {
        display: flex;
        gap: 0.5rem;
    }

    .search-form input {
        flex: 1;
        padding: 0.5rem 0.75rem;
        border: 2px solid #e0e6ed;
        border-radius: 8px;
        font-size: 0.875rem;
    }

    .search-form input:focus {
        outline: none;
        border-color: #338eda;
    }

    .btn-search {
        padding: 0.5rem 1rem;
        background: #ec3750;
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
    }

    .btn-search:hover {
        background: #d32f44;
    }

    .error {
        color: #ec3750;
        font-size: 0.875rem;
        margin-top: 0.5rem;
    }

    .results-section, .data-section {
        background: #fff;
        border: 2px solid #e0e6ed;
        border-radius: 12px;
        padding: 1.25rem;
        margin-bottom: 2rem;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .results-count, .total-count {
        font-size: 0.875rem;
        color: #8492a6;
    }

    .table-container {
        overflow-x: auto;
    }

    .data-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.875rem;
    }

    .data-table th {
        text-align: left;
        padding: 0.75rem 0.5rem;
        font-weight: 500;
        color: #8492a6;
        border-bottom: 2px solid #e0e6ed;
    }

    .data-table td {
        padding: 0.75rem 0.5rem;
        border-bottom: 1px solid #e0e6ed;
    }

    .club-name {
        font-weight: 500;
        color: #1f2d3d;
    }

    .count-badge {
        display: inline-block;
        background: #f1f5f9;
        color: #1f2d3d;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-weight: 500;
    }

    .count-badge.ships {
        background: #338eda;
        color: white;
    }

    .ysws-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
    }

    .badge {
        display: inline-block;
        padding: 0.125rem 0.5rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
    }

    .badge.ysws {
        background: #ff8c37;
        color: white;
    }

    .muted {
        color: #8492a6;
        font-style: italic;
    }

    .actions {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
    }

    .btn-small {
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        border: 1px solid #e0e6ed;
        background: white;
        border-radius: 4px;
        cursor: pointer;
        color: #1f2d3d;
        text-decoration: none;
    }

    .btn-small:hover {
        background: #f9fafc;
    }

    .no-results {
        text-align: center;
        color: #8492a6;
        font-style: italic;
        padding: 1rem 0;
    }
</style>
