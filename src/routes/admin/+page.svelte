<script>
    import AddLeaderModal from '$lib/AddLeaderModal.svelte';
    
    let { data, form } = $props();
    
    let userSearchQuery = $state('');
    let clubSearchQuery = $state('');
    let memberSearchQuery = $state('');
    
    let isClearingCache = $state(false);
    let cacheMessage = $state(null);
    let cacheError = $state(null);
    
    let showAddLeaderModal = $state(false);

    async function clearAllCache() {
        if (isClearingCache) return;
        if (!confirm('Are you sure you want to clear all cached club data? This will force fresh API calls for all users.')) return;
        
        isClearingCache = true;
        cacheMessage = null;
        cacheError = null;

        try {
            const response = await fetch('/api/admin/cache/clear', {
                method: 'POST'
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to clear cache');
            }

            cacheMessage = `Cache cleared: ${result.cleared.clubs} clubs, ${result.cleared.leaders} leader records`;
        } catch (err) {
            cacheError = err.message;
        } finally {
            isClearingCache = false;
        }
    }
</script>

<div class="admin-dashboard">
    <h1>Admin Dashboard</h1>

    <section class="stats-grid">
        <div class="stat-card">
            <div class="stat-header">
                <span class="stat-icon">👥</span>
                <span class="stat-label">Portal Users</span>
            </div>
            <div class="stat-value">{data.stats.users.total}</div>
            <div class="stat-details">
                <span class="stat-detail">{data.stats.users.verified} verified</span>
                <span class="stat-detail">{data.stats.users.admins} admins</span>
                <span class="stat-detail highlight">+{data.stats.users.recentSignups} this week</span>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-header">
                <span class="stat-icon">🧑‍🤝‍🧑</span>
                <span class="stat-label">Club Members</span>
            </div>
            <div class="stat-value">{data.stats.members.total}</div>
            <div class="stat-details">
                <span class="stat-detail">{data.stats.members.clubCount} clubs</span>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-header">
                <span class="stat-icon">🚀</span>
                <span class="stat-label">Ships</span>
            </div>
            <div class="stat-value">{data.stats.ships.total}</div>
            <div class="stat-details">
                <span class="stat-detail">{data.stats.ships.clubCount} clubs</span>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-header">
                <span class="stat-icon">✅</span>
                <span class="stat-label">Events Completed</span>
            </div>
            <div class="stat-value">{data.stats.events.totalCompletions}</div>
            <div class="stat-details">
                <span class="stat-detail">{data.stats.events.uniqueEvents} unique events</span>
                <span class="stat-detail highlight">+{data.stats.events.recentCompletions} this week</span>
            </div>
        </div>

        <div class="stat-card">
            <div class="stat-header">
                <span class="stat-icon">🔐</span>
                <span class="stat-label">Active Sessions</span>
            </div>
            <div class="stat-value">{data.stats.sessions.active}</div>
        </div>
    </section>





    <section class="moderation-section">
        <h2>Quick Search</h2>
        
        <div class="search-panels">
            <div class="search-panel">
                <h3>Find Portal User</h3>
                <form method="POST" action="?/searchUser" class="search-form">
                    <input 
                        type="text" 
                        name="query" 
                        placeholder="Search by email, username, or name..." 
                        bind:value={userSearchQuery}
                        required
                        minlength="2"
                    />
                    <button type="submit" class="btn-search">Search</button>
                </form>
                
                {#if form?.searchError}
                    <p class="error">{form.searchError}</p>
                {/if}
                
                {#if form?.searchResults}
                    <div class="search-results">
                        <p class="results-count">{form.searchResults.length} results for "{form.searchQuery}"</p>
                        {#if form.searchResults.length > 0}
                            <table class="results-table">
                                <thead>
                                    <tr>
                                        <th>User</th>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each form.searchResults as user}
                                        <tr>
                                            <td>
                                                <div class="user-name">{user.first_name || ''} {user.last_name || ''}</div>
                                                <div class="user-username">@{user.username || 'no-username'}</div>
                                            </td>
                                            <td>{user.email || 'N/A'}</td>
                                            <td>
                                                {#if user.is_admin}
                                                    <span class="badge admin">Admin</span>
                                                {/if}
                                                {#if user.identity_verified}
                                                    <span class="badge verified">Verified</span>
                                                {:else}
                                                    <span class="badge unverified">Unverified</span>
                                                {/if}
                                            </td>
                                            <td class="actions">
                                                <form method="POST" action="?/toggleAdmin" class="inline-form">
                                                    <input type="hidden" name="userId" value={user.id} />
                                                    <input type="hidden" name="isAdmin" value={user.is_admin} />
                                                    <button type="submit" class="btn-small">{user.is_admin ? 'Demote' : 'Promote'}</button>
                                                </form>
                                                <form method="POST" action="?/clearSessions" class="inline-form">
                                                    <input type="hidden" name="userId" value={user.id} />
                                                    <button type="submit" class="btn-small btn-warning">End Sessions</button>
                                                </form>
                                                <form method="POST" action="?/deleteUser" class="inline-form" onsubmit={(e) => { if (!confirm('Delete this user permanently?')) e.preventDefault(); }}>
                                                    <input type="hidden" name="userId" value={user.id} />
                                                    <button type="submit" class="btn-small btn-danger">Delete</button>
                                                </form>
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        {/if}
                    </div>
                {/if}
            </div>

            <div class="search-panel">
                <h3>Find Club Member (Airtable)</h3>
                <form method="POST" action="?/searchMember" class="search-form">
                    <input 
                        type="text" 
                        name="query" 
                        placeholder="Search by name or email..." 
                        bind:value={memberSearchQuery}
                        required
                        minlength="2"
                    />
                    <button type="submit" class="btn-search">Search</button>
                </form>
                
                {#if form?.memberSearchError}
                    <p class="error">{form.memberSearchError}</p>
                {/if}
                
                {#if form?.memberSearchResults}
                    <div class="search-results">
                        <p class="results-count">{form.memberSearchResults.length} results for "{form.memberSearchQuery}"</p>
                        {#if form.memberSearchResults.length > 0}
                            <table class="results-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Club</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each form.memberSearchResults as member}
                                        <tr>
                                            <td>{member.name}</td>
                                            <td>{member.email}</td>
                                            <td>{member.club}</td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        {/if}
                    </div>
                {/if}
            </div>

            <div class="search-panel">
                <h3>Find Club (Airtable)</h3>
                <form method="POST" action="?/searchClub" class="search-form">
                    <input 
                        type="text" 
                        name="query" 
                        placeholder="Search by club name..." 
                        bind:value={clubSearchQuery}
                        required
                        minlength="2"
                    />
                    <button type="submit" class="btn-search">Search</button>
                </form>
                
                {#if form?.clubSearchError}
                    <p class="error">{form.clubSearchError}</p>
                {/if}
                
                {#if form?.clubSearchResults}
                    <div class="search-results">
                        <p class="results-count">{form.clubSearchResults.length} results for "{form.clubSearchQuery}"</p>
                        {#if form.clubSearchResults.length > 0}
                            <table class="results-table">
                                <thead>
                                    <tr>
                                        <th>Club</th>
                                        <th>Members</th>
                                        <th>Ships</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each form.clubSearchResults as club}
                                        <tr>
                                            <td>{club.name}</td>
                                            <td>{club.memberCount}</td>
                                            <td>{club.shipCount || 0}</td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        {/if}
                    </div>
                {/if}
            </div>
        </div>
    </section>

    <section class="quick-links">
        <h2>Management</h2>
        {#if cacheMessage}
            <p class="cache-success">{cacheMessage}</p>
        {/if}
        {#if cacheError}
            <p class="cache-error">{cacheError}</p>
        {/if}
        <div class="link-cards">
            <a href="/admin/users" class="link-card">
                <span class="link-icon">👥</span>
                <span class="link-title">All Users</span>
                <span class="link-desc">View and manage portal users</span>
            </a>
            <button class="link-card cache-button" onclick={clearAllCache} disabled={isClearingCache}>
                <span class="link-icon">🗑️</span>
                <span class="link-title">{isClearingCache ? 'Clearing...' : 'Clear Cache'}</span>
                <span class="link-desc">Invalidate all cached club data</span>
            </button>
            <a href="/admin/clubs" class="link-card">
                <span class="link-icon">🏫</span>
                <span class="link-title">All Clubs</span>
                <span class="link-desc">View club data</span>
            </a>
            <a href="/admin/analytics" class="link-card">
                <span class="link-icon">📊</span>
                <span class="link-title">Analytics</span>
                <span class="link-desc">View stats</span>
            </a>
            <button class="link-card" onclick={() => showAddLeaderModal = true}>
                <span class="link-icon">➕</span>
                <span class="link-title">Add Leader</span>
                <span class="link-desc">Create new club leader</span>
            </button>
        </div>
    </section>
    
    <AddLeaderModal bind:open={showAddLeaderModal} onClose={() => showAddLeaderModal = false} />

    <div class="data-panels">
        <section class="data-panel">
            <h2>Top YSWS Programs</h2>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Program</th>
                        <th>Ships</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.shipsData.topYsws as ysws}
                        <tr>
                            <td>{ysws.name}</td>
                            <td>{ysws.count}</td>
                        </tr>
                    {/each}
                    {#if data.shipsData.topYsws.length === 0}
                        <tr><td colspan="2" class="empty">No data</td></tr>
                    {/if}
                </tbody>
            </table>
        </section>

        <section class="data-panel">
            <h2>Top Clubs by Ships</h2>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Club</th>
                        <th>Ships</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.shipsData.topClubs as club}
                        <tr>
                            <td>{club.name}</td>
                            <td>{club.count}</td>
                        </tr>
                    {/each}
                    {#if data.shipsData.topClubs.length === 0}
                        <tr><td colspan="2" class="empty">No data</td></tr>
                    {/if}
                </tbody>
            </table>
        </section>

        <section class="data-panel">
            <h2>Top Clubs by Members</h2>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Club</th>
                        <th>Members</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.membersData.topClubs as club}
                        <tr>
                            <td>{club.name}</td>
                            <td>{club.count}</td>
                        </tr>
                    {/each}
                    {#if data.membersData.topClubs.length === 0}
                        <tr><td colspan="2" class="empty">No data</td></tr>
                    {/if}
                </tbody>
            </table>
        </section>

        <section class="data-panel">
            <h2>Recent Ships</h2>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Ship</th>
                        <th>Club</th>
                        <th>Member</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.shipsData.recentShips as ship}
                        <tr>
                            <td>
                                {#if ship.codeUrl}
                                    <a href={ship.codeUrl} target="_blank" rel="noopener">{ship.name}</a>
                                {:else}
                                    {ship.name}
                                {/if}
                            </td>
                            <td>{ship.club}</td>
                            <td>{ship.memberName}</td>
                        </tr>
                    {/each}
                    {#if data.shipsData.recentShips.length === 0}
                        <tr><td colspan="3" class="empty">No ships</td></tr>
                    {/if}
                </tbody>
            </table>
        </section>

        <section class="data-panel">
            <h2>Recent Portal Users</h2>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Joined</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.recentUsers as user}
                        <tr>
                            <td>
                                <div class="user-name">{user.first_name || ''} {user.last_name || ''}</div>
                                <div class="user-username">@{user.username || 'no-username'}</div>
                            </td>
                            <td>{user.email || 'N/A'}</td>
                            <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        </tr>
                    {/each}
                </tbody>
            </table>
            <a href="/admin/users" class="view-all">View all users →</a>
        </section>

        <section class="data-panel">
            <h2>Top Event Completers</h2>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Completions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.topCompleters as completer}
                        <tr>
                            <td>
                                <div class="user-name">{completer.name || 'Unknown'}</div>
                                <div class="user-username">@{completer.username || 'no-username'}</div>
                            </td>
                            <td>{completer.completions}</td>
                        </tr>
                    {/each}
                    {#if data.topCompleters.length === 0}
                        <tr><td colspan="2" class="empty">No data</td></tr>
                    {/if}
                </tbody>
            </table>
            <a href="/admin/analytics" class="view-all">View analytics →</a>
        </section>
    </div>
</div>

<style>
    .admin-dashboard {
        max-width: 1400px;
        margin: 0 auto;
        padding: 2rem;
    }

    h1 {
        font-size: 2rem;
        font-weight: 700;
        color: #1f2d3d;
        margin-bottom: 2rem;
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
        margin-bottom: 0.75rem;
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
        font-weight: 500;
        color: #8492a6;
    }

    .stat-value {
        font-size: 2rem;
        font-weight: 700;
        color: #1f2d3d;
    }

    .stat-details {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 0.5rem;
    }

    .stat-detail {
        font-size: 0.75rem;
        color: #8492a6;
    }

    .stat-detail.highlight {
        color: #33d6a6;
        font-weight: 500;
    }

    .level-breakdown {
        margin-bottom: 2rem;
    }

    .level-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .level-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 0.75rem;
        background: #fff;
        border: 2px solid #e0e6ed;
        border-radius: 9999px;
    }

    .level-name {
        font-size: 0.875rem;
        font-weight: 500;
        color: #1f2d3d;
    }

    .level-count {
        font-size: 0.75rem;
        font-weight: 600;
        color: #fff;
        background: #338eda;
        padding: 0.125rem 0.5rem;
        border-radius: 9999px;
    }

    .moderation-section {
        margin-bottom: 2rem;
    }

    .search-panels {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 1.5rem;
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
        margin-bottom: 1rem;
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
    }

    .results-count {
        font-size: 0.875rem;
        color: #8492a6;
        margin-bottom: 0.75rem;
    }

    .search-results {
        max-height: 350px;
        overflow-y: auto;
    }

    .results-table, .data-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.875rem;
    }

    .results-table th, .data-table th {
        text-align: left;
        padding: 0.5rem;
        font-weight: 500;
        color: #8492a6;
        border-bottom: 1px solid #e0e6ed;
    }

    .results-table td, .data-table td {
        padding: 0.5rem;
        border-bottom: 1px solid #e0e6ed;
    }

    .data-table td.empty {
        text-align: center;
        color: #8492a6;
        font-style: italic;
    }

    .data-table a {
        color: #338eda;
        text-decoration: none;
    }

    .data-table a:hover {
        text-decoration: underline;
    }

    .user-name {
        font-weight: 500;
        color: #1f2d3d;
    }

    .user-username {
        font-size: 0.75rem;
        color: #8492a6;
    }

    .badge {
        display: inline-block;
        padding: 0.125rem 0.5rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 500;
        margin-right: 0.25rem;
    }

    .badge.admin {
        background: #338eda;
        color: white;
    }

    .badge.verified {
        background: #33d6a6;
        color: white;
    }

    .badge.unverified {
        background: #e0e6ed;
        color: #8492a6;
    }

    .badge.level {
        background: #a633d6;
        color: white;
    }

    .badge.ysws {
        background: #ff8c37;
        color: white;
    }

    .actions {
        display: flex;
        gap: 0.25rem;
        flex-wrap: wrap;
    }

    .inline-form {
        display: inline;
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

    .btn-warning {
        border-color: #ff8c37;
        color: #ff8c37;
    }

    .btn-warning:hover {
        background: #fff7ed;
    }

    .btn-danger {
        border-color: #ec3750;
        color: #ec3750;
    }

    .btn-danger:hover {
        background: #fef2f2;
    }

    .quick-links {
        margin-bottom: 2rem;
    }

    .link-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1rem;
    }

    .link-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1.5rem 1rem;
        background: #fff;
        border: 2px solid #e0e6ed;
        border-radius: 12px;
        text-decoration: none;
        transition: border-color 0.2s;
    }

    .link-card:hover {
        border-color: #ec3750;
    }

    .link-icon {
        font-size: 2rem;
        margin-bottom: 0.5rem;
    }

    .link-title {
        font-weight: 600;
        color: #1f2d3d;
    }

    .link-desc {
        font-size: 0.75rem;
        color: #8492a6;
        text-align: center;
    }

    .data-panels {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
    }

    .data-panel {
        background: #fff;
        border: 2px solid #e0e6ed;
        border-radius: 12px;
        padding: 1.25rem;
    }

    .view-all {
        display: block;
        margin-top: 1rem;
        text-align: center;
        font-size: 0.875rem;
        color: #338eda;
        text-decoration: none;
    }

    .view-all:hover {
        text-decoration: underline;
    }

    .cache-button {
        cursor: pointer;
        border: 2px solid #e0e6ed;
        background: #fff;
    }

    .cache-button:hover:not(:disabled) {
        border-color: #ec3750;
    }

    .cache-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }

    .cache-success {
        color: #33d6a6;
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
    }

    .cache-error {
        color: #ec3750;
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
    }
</style>
