<script>
    let { data, form } = $props();
    
    let searchQuery = $state('');
</script>

<div class="admin-page">
    <div class="page-header">
        <h1>User Management</h1>
        <a href="/admin" class="btn-back">← Back to Dashboard</a>
    </div>

    <section class="search-section">
        <div class="search-panel">
            <h3>Search Users</h3>
            <form method="POST" action="?/search" class="search-form">
                <input 
                    type="text" 
                    name="query" 
                    placeholder="Search by email, username, or name..." 
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
                                <th>User</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Joined</th>
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
                                    <td class="date">{new Date(user.created_at).toLocaleDateString()}</td>
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
                                        <form method="POST" action="?/delete" class="inline-form" onsubmit={(e) => { if (!confirm('Delete this user permanently?')) e.preventDefault(); }}>
                                            <input type="hidden" name="userId" value={user.id} />
                                            <button type="submit" class="btn-small btn-danger">Delete</button>
                                        </form>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {:else}
                <p class="no-results">No users found matching your search.</p>
            {/if}
        </section>
    {/if}

    <section class="data-section">
        <div class="section-header">
            <h2>All Users</h2>
            <span class="total-count">{data.users.length} total users</span>
        </div>

        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each data.users as user}
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
                            <td class="date">{new Date(user.created_at).toLocaleDateString()}</td>
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
                                <form method="POST" action="?/delete" class="inline-form" onsubmit={(e) => { if (!confirm('Delete this user permanently?')) e.preventDefault(); }}>
                                    <input type="hidden" name="userId" value={user.id} />
                                    <button type="submit" class="btn-small btn-danger">Delete</button>
                                </form>
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

    .user-name {
        font-weight: 500;
        color: #1f2d3d;
    }

    .user-username {
        font-size: 0.75rem;
        color: #8492a6;
    }

    .date {
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

    .no-results {
        text-align: center;
        color: #8492a6;
        font-style: italic;
        padding: 1rem 0;
    }
</style>
