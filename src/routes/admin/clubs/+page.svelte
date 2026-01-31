<script>
    let { data, form } = $props();
    
    let searchQuery = $state('');
    let suspendClubName = $state(null);
    let suspendClubId = $state(null);
    let suspendReason = $state('');
    
    function openSuspendDialog(clubName, clubId) {
        suspendClubName = clubName;
        suspendClubId = clubId || 0;
        suspendReason = '';
    }
    
    function closeSuspendDialog() {
        suspendClubName = null;
        suspendClubId = null;
        suspendReason = '';
    }
</script>

<div class="admin-page">
    <header class="page-header">
        <div class="header-content">
            <h1>Club Management</h1>
            <p class="header-subtitle">View and manage all clubs from Airtable</p>
        </div>
    </header>

    <section class="stats-section">
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon clubs">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <span class="stat-value">{data.stats.totalClubs}</span>
                    <span class="stat-label">Total Clubs</span>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon members">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <span class="stat-value">{data.stats.totalMembers}</span>
                    <span class="stat-label">Total Members</span>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon ships">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <span class="stat-value">{data.stats.totalShips}</span>
                    <span class="stat-label">Total Ships</span>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon suspended">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                    </svg>
                </div>
                <div class="stat-content">
                    <span class="stat-value">{data.stats.totalSuspended || 0}</span>
                    <span class="stat-label">Suspended</span>
                </div>
            </div>
        </div>
    </section>

    <section class="search-section">
        <div class="search-panel">
            <form method="POST" action="?/search" class="search-form">
                <div class="search-input-wrapper">
                    <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input 
                        type="text" 
                        name="query" 
                        placeholder="Search by club name..." 
                        bind:value={searchQuery}
                        required
                        minlength="2"
                    />
                </div>
                <button type="submit" class="btn btn-primary">Search</button>
            </form>
            
            {#if form?.searchError}
                <div class="alert alert-error">{form.searchError}</div>
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
            <span class="total-count">{data.stats.totalClubs} total clubs</span>
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
                                <button type="button" class="btn-small btn-danger" onclick={() => openSuspendDialog(club.name, 0)}>
                                    Suspend
                                </button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        
        <!-- Pagination -->
        {#if data.pagination.totalPages > 1}
            <div class="pagination">
                <div class="pagination-info">
                    Showing {(data.pagination.page - 1) * data.pagination.perPage + 1} - {Math.min(data.pagination.page * data.pagination.perPage, data.pagination.totalClubs)} of {data.pagination.totalClubs}
                </div>
                <div class="pagination-controls">
                    {#if data.pagination.page > 1}
                        <a href="?page={data.pagination.page - 1}" class="btn btn-secondary btn-small">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                            Previous
                        </a>
                    {/if}
                    
                    <div class="page-numbers">
                        {#each Array(data.pagination.totalPages) as _, i}
                            {#if i + 1 === 1 || i + 1 === data.pagination.totalPages || (i + 1 >= data.pagination.page - 1 && i + 1 <= data.pagination.page + 1)}
                                <a 
                                    href="?page={i + 1}" 
                                    class="page-number {data.pagination.page === i + 1 ? 'active' : ''}"
                                >
                                    {i + 1}
                                </a>
                            {:else if i + 1 === data.pagination.page - 2 || i + 1 === data.pagination.page + 2}
                                <span class="page-ellipsis">...</span>
                            {/if}
                        {/each}
                    </div>
                    
                    {#if data.pagination.page < data.pagination.totalPages}
                        <a href="?page={data.pagination.page + 1}" class="btn btn-secondary btn-small">
                            Next
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                        </a>
                    {/if}
                </div>
            </div>
        {/if}
    </section>

    {#if data.suspendedClubs && data.suspendedClubs.length > 0}
        <section class="data-section suspended-section">
            <div class="section-header">
                <h2>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                    </svg>
                    Suspended Clubs
                </h2>
                <span class="total-count">{data.suspendedClubs.length} suspended</span>
            </div>

            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Club</th>
                            <th>Reason</th>
                            <th>Suspended On</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each data.suspendedClubs as club}
                            <tr class="suspended-row">
                                <td>
                                    <div class="club-name">{club.club_name}</div>
                                </td>
                                <td>
                                    <span class="reason-text">{club.reason || 'No reason provided'}</span>
                                </td>
                                <td>
                                    <span class="date">{new Date(club.suspended_at).toLocaleDateString()}</span>
                                </td>
                                <td class="actions">
                                    <form method="POST" action="?/unsuspendClub" class="inline-form">
                                        <input type="hidden" name="clubId" value={club.provider_club_id} />
                                        <button type="submit" class="btn-small btn-success">Unsuspend</button>
                                    </form>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </section>
    {/if}
</div>

<!-- Suspend Club Dialog -->
{#if suspendClubName}
    <div class="modal-overlay" onclick={closeSuspendDialog}>
        <div class="modal" onclick={(e) => e.stopPropagation()}>
            <div class="modal-header">
                <h3>Suspend Club</h3>
                <button class="modal-close" onclick={closeSuspendDialog}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <form method="POST" action="?/suspendClub" class="modal-form">
                <input type="hidden" name="clubName" value={suspendClubName} />
                <input type="hidden" name="clubId" value={suspendClubId} />
                <div class="form-group">
                    <label>Club Name</label>
                    <input type="text" value={suspendClubName} disabled class="disabled-input" />
                </div>
                <div class="form-group">
                    <label for="suspend-reason">Reason for suspension</label>
                    <textarea 
                        id="suspend-reason"
                        name="reason" 
                        placeholder="Provide a reason for suspending this club..."
                        bind:value={suspendReason}
                        rows="3"
                    ></textarea>
                </div>
                <div class="modal-warning">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <span>This will block all leaders of this club from accessing its features in the portal.</span>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick={closeSuspendDialog}>Cancel</button>
                    <button type="submit" class="btn btn-danger">Suspend Club</button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    .admin-page {
        max-width: 1200px;
        margin: 0 auto;
        padding: 32px;
    }

    .page-header {
        margin-bottom: 32px;
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

    /* Stats */
    .stats-section {
        margin-bottom: 24px;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
    }

    .stat-card {
        background: white;
        border: 1px solid #e0e6ed;
        border-radius: 12px;
        padding: 20px;
        display: flex;
        gap: 16px;
    }

    .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }

    .stat-icon.clubs {
        background: #e8f0fe;
        color: #338eda;
    }

    .stat-icon.members {
        background: #fee2e6;
        color: #ec3750;
    }

    .stat-icon.ships {
        background: #fef3cd;
        color: #ca8a04;
    }

    .stat-content {
        display: flex;
        flex-direction: column;
    }

    .stat-value {
        font-size: 1.75rem;
        font-weight: 700;
        color: #1f2d3d;
        line-height: 1.2;
    }

    .stat-label {
        font-size: 0.8rem;
        font-weight: 500;
        color: #8492a6;
    }

    /* Search */
    .search-section {
        margin-bottom: 24px;
    }

    .search-panel {
        background: white;
        border: 1px solid #e0e6ed;
        border-radius: 12px;
        padding: 20px;
    }

    .search-form {
        display: flex;
        gap: 12px;
    }

    .search-input-wrapper {
        flex: 1;
        position: relative;
    }

    .search-icon {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        color: #8492a6;
        pointer-events: none;
    }

    .search-input-wrapper input {
        width: 100%;
        padding: 12px 14px 12px 44px;
        font-size: 0.9rem;
        font-family: inherit;
        border: 1px solid #e0e6ed;
        border-radius: 8px;
        transition: all 150ms ease;
    }

    .search-input-wrapper input:focus {
        outline: none;
        border-color: #338eda;
        box-shadow: 0 0 0 3px rgba(51, 142, 218, 0.1);
    }

    .btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        font-size: 0.875rem;
        font-weight: 600;
        font-family: inherit;
        border-radius: 8px;
        cursor: pointer;
        transition: all 150ms ease;
        border: none;
    }

    .btn-primary {
        background: #ec3750;
        color: white;
    }

    .btn-primary:hover {
        background: #d32f44;
    }

    .alert {
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 0.875rem;
        margin-top: 16px;
    }

    .alert-error {
        background: #fff5f5;
        color: #ec3750;
        border: 1px solid #fed7d7;
    }

    /* Results */
    .results-section, .data-section {
        background: white;
        border: 1px solid #e0e6ed;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 24px;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    }

    .section-header h2 {
        font-size: 1rem;
        font-weight: 700;
        color: #1f2d3d;
        margin: 0;
    }

    .results-count, .total-count {
        font-size: 0.8rem;
        color: #8492a6;
    }

    .table-container {
        overflow-x: auto;
    }

    .data-table {
        width: 100%;
        border-collapse: collapse;
    }

    .data-table th {
        text-align: left;
        padding: 12px 12px;
        font-size: 0.7rem;
        font-weight: 600;
        color: #8492a6;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 1px solid #e0e6ed;
    }

    .data-table td {
        padding: 12px 12px;
        font-size: 0.875rem;
        border-bottom: 1px solid #f0f4f8;
        color: #1f2d3d;
    }

    .data-table tr:hover td {
        background: #f9fafc;
    }

    .club-name {
        font-weight: 600;
    }

    .count-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        padding: 4px 10px;
        background: #f0f4f8;
        color: #1f2d3d;
        border-radius: 100px;
        font-weight: 600;
        font-size: 0.8rem;
    }

    .count-badge.ships {
        background: #338eda;
        color: white;
    }

    .ysws-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    .badge {
        display: inline-flex;
        align-items: center;
        padding: 3px 8px;
        border-radius: 100px;
        font-size: 0.65rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.03em;
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
        gap: 6px;
    }

    .btn-small {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        font-size: 0.75rem;
        font-weight: 500;
        font-family: inherit;
        color: #338eda;
        background: white;
        border: 1px solid #e0e6ed;
        border-radius: 6px;
        cursor: pointer;
        text-decoration: none;
        transition: all 150ms ease;
    }

    .btn-small:hover {
        background: #f9fafc;
        border-color: #338eda;
    }

    .btn-small.btn-danger {
        background: #ec3750;
        color: white;
        border-color: #ec3750;
    }

    .btn-small.btn-danger:hover {
        background: #d32f44;
        border-color: #d32f44;
    }

    .btn-small.btn-success {
        color: #33d6a6;
    }

    .btn-small.btn-success:hover {
        background: #ecfdf5;
        border-color: #33d6a6;
    }

    .inline-form {
        display: inline;
    }

    /* Suspended section */
    .suspended-section {
        border-color: #fed7d7;
    }

    .suspended-section .section-header h2 {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #ec3750;
    }

    .suspended-row {
        background: #fef2f2;
    }

    .reason-text {
        font-size: 0.8rem;
        color: #8492a6;
    }

    .date {
        font-size: 0.8rem;
        color: #8492a6;
    }

    /* Stats suspended */
    .stat-icon.suspended {
        background: #fef2f2;
        color: #ec3750;
    }

    /* Modal */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
    }

    .modal {
        background: white;
        border-radius: 12px;
        width: 100%;
        max-width: 480px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #e0e6ed;
    }

    .modal-header h3 {
        font-size: 1.1rem;
        font-weight: 700;
        color: #1f2d3d;
        margin: 0;
    }

    .modal-close {
        background: none;
        border: none;
        padding: 4px;
        cursor: pointer;
        color: #8492a6;
        border-radius: 4px;
        transition: all 150ms ease;
    }

    .modal-close:hover {
        background: #f0f4f8;
        color: #1f2d3d;
    }

    .modal-form {
        padding: 24px;
    }

    .form-group {
        margin-bottom: 20px;
    }

    .form-group label {
        display: block;
        font-size: 0.85rem;
        font-weight: 600;
        color: #1f2d3d;
        margin-bottom: 8px;
    }

    .form-group input,
    .form-group textarea {
        width: 100%;
        padding: 12px;
        font-size: 0.9rem;
        font-family: inherit;
        border: 1px solid #e0e6ed;
        border-radius: 8px;
        transition: all 150ms ease;
    }

    .form-group input:focus,
    .form-group textarea:focus {
        outline: none;
        border-color: #338eda;
        box-shadow: 0 0 0 3px rgba(51, 142, 218, 0.1);
    }

    .disabled-input {
        background: #f9fafc;
        color: #8492a6;
        cursor: not-allowed;
    }

    .form-group textarea {
        resize: vertical;
    }

    .modal-warning {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 12px 14px;
        background: #fff7ed;
        border: 1px solid #fed7aa;
        border-radius: 8px;
        margin-bottom: 20px;
    }

    .modal-warning svg {
        flex-shrink: 0;
        color: #ff8c37;
        margin-top: 2px;
    }

    .modal-warning span {
        font-size: 0.8rem;
        color: #9a3412;
        line-height: 1.5;
    }

    .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding-top: 8px;
    }

    .btn-secondary {
        background: #f0f4f8;
        color: #1f2d3d;
    }

    .btn-secondary:hover {
        background: #e0e6ed;
    }

    .btn-danger {
        background: #ec3750;
        color: white;
    }

    .btn-danger:hover {
        background: #d32f44;
    }

    .no-results {
        text-align: center;
        color: #8492a6;
        font-style: italic;
        padding: 24px;
    }

    @media (max-width: 900px) {
        .admin-page {
            padding: 20px;
        }

        .stats-grid {
            grid-template-columns: 1fr;
        }

        .search-form {
            flex-direction: column;
        }
        
        .pagination {
            flex-direction: column;
            gap: 16px;
        }
        
        .pagination-controls {
            justify-content: center;
        }
    }

    /* Pagination */
    .pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 0;
        margin-top: 16px;
        border-top: 1px solid #e0e6ed;
    }

    .pagination-info {
        font-size: 0.85rem;
        color: #8492a6;
    }

    .pagination-controls {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .page-numbers {
        display: flex;
        align-items: center;
        gap: 4px;
    }

    .page-number {
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        height: 32px;
        padding: 0 8px;
        font-size: 0.85rem;
        color: #1f2d3d;
        text-decoration: none;
        border-radius: 6px;
        transition: all 150ms ease;
    }

    .page-number:hover {
        background: #f0f4f8;
    }

    .page-number.active {
        background: #ec3750;
        color: white;
        font-weight: 600;
    }

    .page-ellipsis {
        color: #8492a6;
        padding: 0 4px;
    }
</style>
