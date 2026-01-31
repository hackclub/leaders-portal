<script>
    import AddLeaderModal from '$lib/AddLeaderModal.svelte';
    import { toasts } from '$lib/stores/toast.js';
    
    let { data, form } = $props();
    
    let userSearchQuery = $state('');
    let clubSearchQuery = $state('');
    let memberSearchQuery = $state('');
    
    let isClearingCache = $state(false);
    let showAddLeaderModal = $state(false);
    let activeSearchTab = $state('users');

    async function clearAllCache() {
        if (isClearingCache) return;
        if (!confirm('Are you sure you want to clear all cached club data? This will force fresh API calls for all users.')) return;
        
        isClearingCache = true;

        try {
            const response = await fetch('/api/admin/cache/clear', {
                method: 'POST'
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to clear cache');
            }

            toasts.success(`Cache cleared: ${result.cleared.clubs} clubs, ${result.cleared.leaders} leader records`);
        } catch (err) {
            toasts.error(err.message);
        } finally {
            isClearingCache = false;
        }
    }

    $effect(() => {
        if (form?.toggleSuccess) {
            toasts.success(form.toggleSuccess);
        }
        if (form?.clearSuccess) {
            toasts.success(form.clearSuccess);
        }
        if (form?.deleteSuccess) {
            toasts.success(form.deleteSuccess);
        }
        if (form?.searchError || form?.memberSearchError || form?.clubSearchError) {
            toasts.error(form.searchError || form.memberSearchError || form.clubSearchError);
        }
    });
</script>

<div class="admin-dashboard">
    <!-- Header -->
    <header class="dashboard-header">
        <div class="header-content">
            <h1>Admin Dashboard</h1>
            <p class="header-subtitle">Manage users, clubs, and monitor platform activity</p>
        </div>
        <div class="header-actions">
            <button class="btn btn-secondary" onclick={() => showAddLeaderModal = true}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <line x1="19" y1="8" x2="19" y2="14"/>
                    <line x1="22" y1="11" x2="16" y2="11"/>
                </svg>
                Add Leader
            </button>
            <button class="btn btn-danger-outline" onclick={clearAllCache} disabled={isClearingCache}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="23 4 23 10 17 10"/>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                {isClearingCache ? 'Clearing...' : 'Clear Cache'}
            </button>
        </div>
    </header>

    <!-- Stats Overview -->
    <section class="stats-section">
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon users">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <span class="stat-value">{data.stats.users.total}</span>
                    <span class="stat-label">Portal Users</span>
                    <div class="stat-meta">
                        <span class="meta-item">{data.stats.users.verified} verified</span>
                        <span class="meta-item">{data.stats.users.admins} admins</span>
                        <span class="meta-item positive">+{data.stats.users.recentSignups} this week</span>
                    </div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon members">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                        <path d="M2 17l10 5 10-5"/>
                        <path d="M2 12l10 5 10-5"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <span class="stat-value">{data.stats.members.total}</span>
                    <span class="stat-label">Club Members</span>
                    <div class="stat-meta">
                        <span class="meta-item">across {data.stats.members.clubCount} clubs</span>
                    </div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon ships">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <span class="stat-value">{data.stats.ships.total}</span>
                    <span class="stat-label">Ships</span>
                    <div class="stat-meta">
                        <span class="meta-item">across {data.stats.ships.clubCount} clubs</span>
                    </div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon events">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <span class="stat-value">{data.stats.events.totalCompletions}</span>
                    <span class="stat-label">Events Completed</span>
                    <div class="stat-meta">
                        <span class="meta-item">{data.stats.events.uniqueEvents} unique</span>
                        <span class="meta-item positive">+{data.stats.events.recentCompletions} this week</span>
                    </div>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon sessions">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <span class="stat-value">{data.stats.sessions.active}</span>
                    <span class="stat-label">Active Sessions</span>
                </div>
            </div>
        </div>
    </section>

    <!-- Quick Actions -->
    <section class="quick-actions">
        <h2 class="section-title">Quick Actions</h2>
        <div class="actions-grid">
            <a href="/admin/users" class="action-card">
                <div class="action-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                </div>
                <div class="action-content">
                    <span class="action-title">All Users</span>
                    <span class="action-desc">View and manage portal users</span>
                </div>
                <svg class="action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                </svg>
            </a>

            <a href="/admin/clubs" class="action-card">
                <div class="action-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                </div>
                <div class="action-content">
                    <span class="action-title">All Clubs</span>
                    <span class="action-desc">View and manage club data</span>
                </div>
                <svg class="action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                </svg>
            </a>

            <a href="/admin/analytics" class="action-card">
                <div class="action-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10"/>
                        <line x1="12" y1="20" x2="12" y2="4"/>
                        <line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                </div>
                <div class="action-content">
                    <span class="action-title">Analytics</span>
                    <span class="action-desc">Platform statistics and insights</span>
                </div>
                <svg class="action-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                </svg>
            </a>
        </div>
    </section>

    <!-- Search Section -->
    <section class="search-section">
        <h2 class="section-title">Quick Search</h2>
        
        <div class="search-tabs">
            <button 
                class="search-tab" 
                class:active={activeSearchTab === 'users'}
                onclick={() => activeSearchTab = 'users'}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
                Portal Users
            </button>
            <button 
                class="search-tab" 
                class:active={activeSearchTab === 'members'}
                onclick={() => activeSearchTab = 'members'}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                Club Members
            </button>
            <button 
                class="search-tab" 
                class:active={activeSearchTab === 'clubs'}
                onclick={() => activeSearchTab = 'clubs'}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                Clubs
            </button>
        </div>

        <div class="search-content">
            {#if activeSearchTab === 'users'}
                <form method="POST" action="?/searchUser" class="search-form">
                    <div class="search-input-wrapper">
                        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input 
                            type="text" 
                            name="query" 
                            placeholder="Search by email, username, or name..." 
                            bind:value={userSearchQuery}
                            required
                            minlength="2"
                        />
                    </div>
                    <button type="submit" class="btn btn-primary">Search</button>
                </form>
                
                {#if form?.searchError}
                    <div class="alert alert-error">{form.searchError}</div>
                {/if}
                
                {#if form?.searchResults}
                    <div class="search-results">
                        <p class="results-count">{form.searchResults.length} results for "{form.searchQuery}"</p>
                        {#if form.searchResults.length > 0}
                            <div class="table-wrapper">
                                <table class="data-table">
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
                                                    <div class="user-cell">
                                                        <span class="user-name">{user.first_name || ''} {user.last_name || ''}</span>
                                                        <span class="user-username">@{user.username || 'no-username'}</span>
                                                    </div>
                                                </td>
                                                <td class="email-cell">{user.email || 'N/A'}</td>
                                                <td>
                                                    <div class="badge-group">
                                                        {#if user.is_admin}
                                                            <span class="badge badge-admin">Admin</span>
                                                        {/if}
                                                        {#if user.identity_verified}
                                                            <span class="badge badge-verified">Verified</span>
                                                        {:else}
                                                            <span class="badge badge-unverified">Unverified</span>
                                                        {/if}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div class="action-buttons">
                                                        <form method="POST" action="?/toggleAdmin" class="inline-form">
                                                            <input type="hidden" name="userId" value={user.id} />
                                                            <input type="hidden" name="isAdmin" value={user.is_admin} />
                                                            <button type="submit" class="btn-action">
                                                                {#if user.is_admin}
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                                        <path d="M18 6L6 18M6 6l12 12"/>
                                                                    </svg>
                                                                    Demote
                                                                {:else}
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                                        <path d="M12 5v14M5 12h14"/>
                                                                    </svg>
                                                                    Promote
                                                                {/if}
                                                            </button>
                                                        </form>
                                                        <form method="POST" action="?/clearSessions" class="inline-form">
                                                            <input type="hidden" name="userId" value={user.id} />
                                                            <button type="submit" class="btn-action btn-action-warning">
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                                                    <polyline points="16 17 21 12 16 7"/>
                                                                    <line x1="21" y1="12" x2="9" y2="12"/>
                                                                </svg>
                                                                End Sessions
                                                            </button>
                                                        </form>
                                                        <form method="POST" action="?/deleteUser" class="inline-form" onsubmit={(e) => { if (!confirm('Delete this user permanently?')) e.preventDefault(); }}>
                                                            <input type="hidden" name="userId" value={user.id} />
                                                            <button type="submit" class="btn-action btn-action-danger">
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                                    <polyline points="3 6 5 6 21 6"/>
                                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                                </svg>
                                                                Delete
                                                            </button>
                                                        </form>
                                                    </div>
                                                </td>
                                            </tr>
                                        {/each}
                                    </tbody>
                                </table>
                            </div>
                        {/if}
                    </div>
                {/if}
            {:else if activeSearchTab === 'members'}
                <form method="POST" action="?/searchMember" class="search-form">
                    <div class="search-input-wrapper">
                        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input 
                            type="text" 
                            name="query" 
                            placeholder="Search by name or email..." 
                            bind:value={memberSearchQuery}
                            required
                            minlength="2"
                        />
                    </div>
                    <button type="submit" class="btn btn-primary">Search</button>
                </form>
                
                {#if form?.memberSearchError}
                    <div class="alert alert-error">{form.memberSearchError}</div>
                {/if}
                
                {#if form?.memberSearchResults}
                    <div class="search-results">
                        <p class="results-count">{form.memberSearchResults.length} results for "{form.memberSearchQuery}"</p>
                        {#if form.memberSearchResults.length > 0}
                            <div class="table-wrapper">
                                <table class="data-table">
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
                                                <td class="name-cell">{member.name}</td>
                                                <td class="email-cell">{member.email}</td>
                                                <td>{member.club}</td>
                                            </tr>
                                        {/each}
                                    </tbody>
                                </table>
                            </div>
                        {/if}
                    </div>
                {/if}
            {:else if activeSearchTab === 'clubs'}
                <form method="POST" action="?/searchClub" class="search-form">
                    <div class="search-input-wrapper">
                        <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input 
                            type="text" 
                            name="query" 
                            placeholder="Search by club name..." 
                            bind:value={clubSearchQuery}
                            required
                            minlength="2"
                        />
                    </div>
                    <button type="submit" class="btn btn-primary">Search</button>
                </form>
                
                {#if form?.clubSearchError}
                    <div class="alert alert-error">{form.clubSearchError}</div>
                {/if}
                
                {#if form?.clubSearchResults}
                    <div class="search-results">
                        <p class="results-count">{form.clubSearchResults.length} results for "{form.clubSearchQuery}"</p>
                        {#if form.clubSearchResults.length > 0}
                            <div class="table-wrapper">
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th>Club Name</th>
                                            <th>Members</th>
                                            <th>Ships</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {#each form.clubSearchResults as club}
                                            <tr>
                                                <td class="name-cell">{club.name}</td>
                                                <td>{club.memberCount}</td>
                                                <td>{club.shipCount || 0}</td>
                                            </tr>
                                        {/each}
                                    </tbody>
                                </table>
                            </div>
                        {/if}
                    </div>
                {/if}
            {/if}
        </div>
    </section>

    <!-- Data Panels -->
    <section class="data-section">
        <h2 class="section-title">Platform Overview</h2>
        
        <div class="data-grid">
            <div class="data-panel">
                <div class="panel-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <h3>Top YSWS Programs</h3>
                </div>
                <div class="table-wrapper">
                    <table class="data-table compact">
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
                                    <td class="number-cell">{ysws.count}</td>
                                </tr>
                            {/each}
                            {#if data.shipsData.topYsws.length === 0}
                                <tr><td colspan="2" class="empty-cell">No data available</td></tr>
                            {/if}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="data-panel">
                <div class="panel-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <h3>Top Clubs by Ships</h3>
                </div>
                <div class="table-wrapper">
                    <table class="data-table compact">
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
                                    <td class="number-cell">{club.count}</td>
                                </tr>
                            {/each}
                            {#if data.shipsData.topClubs.length === 0}
                                <tr><td colspan="2" class="empty-cell">No data available</td></tr>
                            {/if}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="data-panel">
                <div class="panel-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <h3>Top Clubs by Members</h3>
                </div>
                <div class="table-wrapper">
                    <table class="data-table compact">
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
                                    <td class="number-cell">{club.count}</td>
                                </tr>
                            {/each}
                            {#if data.membersData.topClubs.length === 0}
                                <tr><td colspan="2" class="empty-cell">No data available</td></tr>
                            {/if}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="data-panel">
                <div class="panel-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <h3>Recent Ships</h3>
                </div>
                <div class="table-wrapper">
                    <table class="data-table compact">
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
                                            <a href={ship.codeUrl} target="_blank" rel="noopener" class="link">{ship.name}</a>
                                        {:else}
                                            {ship.name}
                                        {/if}
                                    </td>
                                    <td>{ship.club}</td>
                                    <td>{ship.memberName}</td>
                                </tr>
                            {/each}
                            {#if data.shipsData.recentShips.length === 0}
                                <tr><td colspan="3" class="empty-cell">No ships yet</td></tr>
                            {/if}
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="data-panel">
                <div class="panel-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <h3>Recent Portal Users</h3>
                </div>
                <div class="table-wrapper">
                    <table class="data-table compact">
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
                                        <div class="user-cell">
                                            <span class="user-name">{user.first_name || ''} {user.last_name || ''}</span>
                                            <span class="user-username">@{user.username || 'no-username'}</span>
                                        </div>
                                    </td>
                                    <td class="email-cell">{user.email || 'N/A'}</td>
                                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
                <a href="/admin/users" class="panel-link">
                    View all users
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                    </svg>
                </a>
            </div>

            <div class="data-panel">
                <div class="panel-header">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    <h3>Top Event Completers</h3>
                </div>
                <div class="table-wrapper">
                    <table class="data-table compact">
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
                                        <div class="user-cell">
                                            <span class="user-name">{completer.name || 'Unknown'}</span>
                                            <span class="user-username">@{completer.username || 'no-username'}</span>
                                        </div>
                                    </td>
                                    <td class="number-cell">{completer.completions}</td>
                                </tr>
                            {/each}
                            {#if data.topCompleters.length === 0}
                                <tr><td colspan="2" class="empty-cell">No data available</td></tr>
                            {/if}
                        </tbody>
                    </table>
                </div>
                <a href="/admin/analytics" class="panel-link">
                    View analytics
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/>
                        <polyline points="12 5 19 12 12 19"/>
                    </svg>
                </a>
            </div>
        </div>
    </section>
</div>

<AddLeaderModal bind:open={showAddLeaderModal} onClose={() => showAddLeaderModal = false} />

<style>
    .admin-dashboard {
        max-width: 1400px;
        margin: 0 auto;
        padding: 32px;
    }

    /* Header */
    .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 24px;
        margin-bottom: 32px;
        padding-bottom: 24px;
        border-bottom: 1px solid #e0e6ed;
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

    .header-actions {
        display: flex;
        gap: 12px;
        flex-shrink: 0;
    }

    /* Buttons */
    .btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
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

    .btn-secondary {
        background: #f9fafc;
        color: #1f2d3d;
        border: 1px solid #e0e6ed;
    }

    .btn-secondary:hover {
        background: #e0e6ed;
    }

    .btn-danger-outline {
        background: white;
        color: #ec3750;
        border: 1px solid #ec3750;
    }

    .btn-danger-outline:hover:not(:disabled) {
        background: #fff5f5;
    }

    .btn-danger-outline:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    /* Section titles */
    .section-title {
        font-size: 1rem;
        font-weight: 700;
        color: #1f2d3d;
        margin: 0 0 16px 0;
        text-transform: uppercase;
        letter-spacing: 0.03em;
    }

    /* Stats Section */
    .stats-section {
        margin-bottom: 32px;
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 16px;
    }

    .stat-card {
        background: white;
        border: 1px solid #e0e6ed;
        border-radius: 12px;
        padding: 20px;
        display: flex;
        gap: 16px;
        transition: all 200ms ease;
    }

    .stat-card:hover {
        border-color: #c0c6d0;
        box-shadow: 0 4px 12px rgba(31, 45, 61, 0.08);
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

    .stat-icon.users {
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

    .stat-icon.events {
        background: #d1fae5;
        color: #059669;
    }

    .stat-icon.sessions {
        background: #ede9fe;
        color: #7c3aed;
    }

    .stat-content {
        display: flex;
        flex-direction: column;
        min-width: 0;
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
        margin-bottom: 8px;
    }

    .stat-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    .meta-item {
        font-size: 0.7rem;
        color: #8492a6;
        background: #f9fafc;
        padding: 2px 8px;
        border-radius: 100px;
    }

    .meta-item.positive {
        color: #059669;
        background: #ecfdf5;
        font-weight: 600;
    }

    /* Quick Actions */
    .quick-actions {
        margin-bottom: 32px;
    }

    .actions-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
    }

    .action-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px 20px;
        background: white;
        border: 1px solid #e0e6ed;
        border-radius: 12px;
        text-decoration: none;
        color: inherit;
        transition: all 200ms ease;
    }

    .action-card:hover {
        border-color: #ec3750;
        box-shadow: 0 4px 12px rgba(236, 55, 80, 0.1);
    }

    .action-card:hover .action-arrow {
        transform: translateX(4px);
        color: #ec3750;
    }

    .action-icon {
        width: 40px;
        height: 40px;
        background: #fee2e6;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ec3750;
        flex-shrink: 0;
    }

    .action-content {
        flex: 1;
        min-width: 0;
    }

    .action-title {
        display: block;
        font-weight: 600;
        color: #1f2d3d;
        margin-bottom: 2px;
    }

    .action-desc {
        display: block;
        font-size: 0.8rem;
        color: #8492a6;
    }

    .action-arrow {
        color: #c0c6d0;
        transition: all 200ms ease;
        flex-shrink: 0;
    }

    /* Search Section */
    .search-section {
        margin-bottom: 32px;
    }

    .search-tabs {
        display: flex;
        gap: 4px;
        margin-bottom: 16px;
        background: #f9fafc;
        padding: 4px;
        border-radius: 10px;
        width: fit-content;
    }

    .search-tab {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        font-size: 0.875rem;
        font-weight: 500;
        font-family: inherit;
        color: #8492a6;
        background: transparent;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 150ms ease;
    }

    .search-tab:hover {
        color: #1f2d3d;
    }

    .search-tab.active {
        background: white;
        color: #1f2d3d;
        box-shadow: 0 1px 3px rgba(31, 45, 61, 0.08);
    }

    .search-content {
        background: white;
        border: 1px solid #e0e6ed;
        border-radius: 12px;
        padding: 20px;
    }

    .search-form {
        display: flex;
        gap: 12px;
        margin-bottom: 16px;
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

    .search-input-wrapper input::placeholder {
        color: #a0aec0;
    }

    .search-results {
        max-height: 400px;
        overflow-y: auto;
    }

    .results-count {
        font-size: 0.8rem;
        color: #8492a6;
        margin-bottom: 12px;
    }

    .alert {
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 0.875rem;
        margin-bottom: 16px;
    }

    .alert-error {
        background: #fff5f5;
        color: #ec3750;
        border: 1px solid #fed7d7;
    }

    /* Tables */
    .table-wrapper {
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

    .data-table tr:last-child td {
        border-bottom: none;
    }

    .data-table tr:hover td {
        background: #f9fafc;
    }

    .data-table.compact th {
        padding: 10px 10px;
    }

    .data-table.compact td {
        padding: 10px 10px;
        font-size: 0.8rem;
    }

    .user-cell {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .user-name {
        font-weight: 600;
        color: #1f2d3d;
    }

    .user-username {
        font-size: 0.75rem;
        color: #8492a6;
    }

    .email-cell {
        color: #8492a6;
    }

    .name-cell {
        font-weight: 500;
    }

    .number-cell {
        font-weight: 600;
        color: #ec3750;
    }

    .empty-cell {
        text-align: center;
        color: #8492a6;
        font-style: italic;
        padding: 24px !important;
    }

    .link {
        color: #338eda;
        text-decoration: none;
        font-weight: 500;
    }

    .link:hover {
        text-decoration: underline;
    }

    /* Badges */
    .badge-group {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
    }

    .badge {
        display: inline-flex;
        align-items: center;
        padding: 3px 8px;
        font-size: 0.65rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        border-radius: 100px;
    }

    .badge-admin {
        background: #338eda;
        color: white;
    }

    .badge-verified {
        background: #33d6a6;
        color: white;
    }

    .badge-unverified {
        background: #f0f4f8;
        color: #8492a6;
    }

    /* Action Buttons */
    .action-buttons {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
    }

    .inline-form {
        display: inline;
    }

    .btn-action {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 6px 10px;
        font-size: 0.75rem;
        font-weight: 500;
        font-family: inherit;
        color: #1f2d3d;
        background: white;
        border: 1px solid #e0e6ed;
        border-radius: 6px;
        cursor: pointer;
        transition: all 150ms ease;
    }

    .btn-action:hover {
        background: #f9fafc;
        border-color: #c0c6d0;
    }

    .btn-action-warning {
        color: #ff8c37;
        border-color: #ffedd5;
    }

    .btn-action-warning:hover {
        background: #fff7ed;
        border-color: #ff8c37;
    }

    .btn-action-danger {
        color: #ec3750;
        border-color: #fed7d7;
    }

    .btn-action-danger:hover {
        background: #fff5f5;
        border-color: #ec3750;
    }

    /* Data Section */
    .data-section {
        margin-bottom: 32px;
    }

    .data-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
    }

    .data-panel {
        background: white;
        border: 1px solid #e0e6ed;
        border-radius: 12px;
        overflow: hidden;
    }

    .panel-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 16px 20px;
        border-bottom: 1px solid #f0f4f8;
        color: #8492a6;
    }

    .panel-header h3 {
        font-size: 0.875rem;
        font-weight: 600;
        color: #1f2d3d;
        margin: 0;
    }

    .data-panel .table-wrapper {
        padding: 0 8px;
        max-height: 280px;
        overflow-y: auto;
    }

    .panel-link {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 14px;
        font-size: 0.8rem;
        font-weight: 600;
        color: #338eda;
        text-decoration: none;
        border-top: 1px solid #f0f4f8;
        transition: all 150ms ease;
    }

    .panel-link:hover {
        background: #f9fafc;
        color: #ec3750;
    }

    /* Responsive */
    @media (max-width: 1200px) {
        .stats-grid {
            grid-template-columns: repeat(3, 1fr);
        }

        .stats-grid .stat-card:nth-child(4),
        .stats-grid .stat-card:nth-child(5) {
            grid-column: span 1;
        }

        .data-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 900px) {
        .admin-dashboard {
            padding: 20px;
        }

        .dashboard-header {
            flex-direction: column;
            align-items: stretch;
        }

        .header-actions {
            flex-wrap: wrap;
        }

        .stats-grid {
            grid-template-columns: repeat(2, 1fr);
        }

        .actions-grid {
            grid-template-columns: 1fr;
        }

        .search-tabs {
            width: 100%;
            overflow-x: auto;
        }

        .search-form {
            flex-direction: column;
        }

        .data-grid {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 600px) {
        .stats-grid {
            grid-template-columns: 1fr;
        }

        .stat-card {
            flex-direction: column;
            align-items: flex-start;
        }

        .action-buttons {
            flex-direction: column;
        }
    }
</style>
