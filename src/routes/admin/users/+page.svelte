<script>
    let { data, form } = $props();
    
    let searchQuery = $state('');
    let openMenuId = $state(null);
    let suspendUserId = $state(null);
    let suspendReason = $state('');
    let showClubsModal = $state(false);
    
    function getUserDisplayName(user) {
        const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
        if (fullName) return fullName;
        if (user.username) return user.username;
        if (user.email) return user.email.split('@')[0];
        return 'Unknown User';
    }
    
    function getUserSecondary(user) {
        if (user.username) return `@${user.username}`;
        return null; // Don't show anything if no username
    }
    
    $effect(() => {
        if (form?.viewingClubs) {
            showClubsModal = true;
        }
    });
    
    function toggleMenu(userId) {
        openMenuId = openMenuId === userId ? null : userId;
    }
    
    function closeMenu() {
        openMenuId = null;
    }
    
    function handleClickOutside(event) {
        if (!event.target.closest('.action-menu') && !event.target.closest('.modal')) {
            closeMenu();
        }
    }
    
    function openSuspendDialog(userId) {
        suspendUserId = userId;
        suspendReason = '';
        closeMenu();
    }
    
    function closeSuspendDialog() {
        suspendUserId = null;
        suspendReason = '';
    }
    
    function closeClubsModal() {
        showClubsModal = false;
    }
</script>

<svelte:window onclick={handleClickOutside} />

<div class="admin-page">
    <div class="page-header">
        <div class="header-content">
            <h1>User Management</h1>
            <p class="header-subtitle">Manage registered users and permissions</p>
        </div>
    </div>

    <section class="search-section">
        <div class="search-panel">
            <form method="POST" action="?/search" class="search-form">
                <div class="search-input-wrapper">
                    <span class="search-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.35-4.35"></path>
                        </svg>
                    </span>
                    <input 
                        type="text" 
                        name="query" 
                        placeholder="Search by email, username, or name..." 
                        bind:value={searchQuery}
                        required
                        minlength="2"
                    />
                </div>
                <button type="submit" class="btn btn-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    Search
                </button>
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
                                        <div class="user-info">
                                            <div class="user-avatar">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                                    <circle cx="12" cy="7" r="4"></circle>
                                                </svg>
                                            </div>
                                            <div>
                                                <div class="user-name">{getUserDisplayName(user)}</div>
                                                {#if getUserSecondary(user)}
                                                    <div class="user-username">{getUserSecondary(user)}</div>
                                                {/if}
                                            </div>
                                        </div>
                                    </td>
                                    <td>{user.email || 'N/A'}</td>
                                    <td>
                                        <div class="badge-group">
                                            {#if user.is_suspended}
                                                <span class="badge suspended">Suspended</span>
                                            {/if}
                                            {#if user.is_admin}
                                                <span class="badge admin">Admin</span>
                                            {/if}
                                            {#if user.identity_verified}
                                                <span class="badge verified">Verified</span>
                                            {:else}
                                                <span class="badge unverified">Unverified</span>
                                            {/if}
                                        </div>
                                    </td>
                                    <td class="date">{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <div class="action-menu">
                                            <button class="menu-trigger" onclick={() => toggleMenu('search-' + user.id)} aria-label="Actions">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                    <circle cx="12" cy="5" r="1"></circle>
                                                    <circle cx="12" cy="12" r="1"></circle>
                                                    <circle cx="12" cy="19" r="1"></circle>
                                                </svg>
                                            </button>
                                            {#if openMenuId === 'search-' + user.id}
                                                <div class="dropdown-menu">
                                                    <form method="POST" action="?/viewClubs" class="menu-form">
                                                        <input type="hidden" name="userId" value={user.id} />
                                                        <button type="submit" class="menu-item">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                                            </svg>
                                                            View Clubs
                                                        </button>
                                                    </form>
                                                    <form method="POST" action="?/toggleAdmin" class="menu-form">
                                                        <input type="hidden" name="userId" value={user.id} />
                                                        <input type="hidden" name="isAdmin" value={user.is_admin} />
                                                        <button type="submit" class="menu-item">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                                <path d="M12 20h9"></path>
                                                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                                            </svg>
                                                            {user.is_admin ? 'Demote from Admin' : 'Promote to Admin'}
                                                        </button>
                                                    </form>
                                                    <form method="POST" action="?/loginAs" class="menu-form" onsubmit={(e) => { if (!confirm(`Login as ${user.email}? You will be logged out of your current session.`)) e.preventDefault(); }}>
                                                        <input type="hidden" name="userId" value={user.id} />
                                                        <button type="submit" class="menu-item">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                                                                <polyline points="10 17 15 12 10 7"></polyline>
                                                                <line x1="15" y1="12" x2="3" y2="12"></line>
                                                            </svg>
                                                            Login as User
                                                        </button>
                                                    </form>
                                                    <div class="menu-divider"></div>
                                                    <form method="POST" action="?/clearSessions" class="menu-form">
                                                        <input type="hidden" name="userId" value={user.id} />
                                                        <button type="submit" class="menu-item warning">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                                <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                                                                <line x1="12" y1="2" x2="12" y2="12"></line>
                                                            </svg>
                                                            End All Sessions
                                                        </button>
                                                    </form>
                                                    {#if user.is_suspended}
                                                        <form method="POST" action="?/unsuspend" class="menu-form">
                                                            <input type="hidden" name="userId" value={user.id} />
                                                            <button type="submit" class="menu-item success">
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                                                </svg>
                                                                Unsuspend User
                                                            </button>
                                                        </form>
                                                    {:else}
                                                        <button type="button" class="menu-item danger" onclick={() => openSuspendDialog(user.id)}>
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                                <circle cx="12" cy="12" r="10"></circle>
                                                                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                                                            </svg>
                                                            Suspend User
                                                        </button>
                                                    {/if}
                                                    <form method="POST" action="?/delete" class="menu-form" onsubmit={(e) => { if (!confirm('Delete this user permanently?')) e.preventDefault(); }}>
                                                        <input type="hidden" name="userId" value={user.id} />
                                                        <button type="submit" class="menu-item danger">
                                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                            </svg>
                                                            Delete User
                                                        </button>
                                                    </form>
                                                </div>
                                            {/if}
                                        </div>
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
            <div class="header-actions">
                <div class="sort-dropdown">
                    <label for="sort-select">Sort by:</label>
                    <select id="sort-select" onchange={(e) => window.location.href = `?sort=${e.target.value}`}>
                        <option value="newest" selected={data.sort === 'newest'}>Newest First</option>
                        <option value="oldest" selected={data.sort === 'oldest'}>Oldest First</option>
                        <option value="admin" selected={data.sort === 'admin'}>Admins First</option>
                        <option value="suspended" selected={data.sort === 'suspended'}>Suspended First</option>
                        <option value="verified" selected={data.sort === 'verified'}>Verified First</option>
                        <option value="unverified" selected={data.sort === 'unverified'}>Unverified First</option>
                    </select>
                </div>
                <span class="total-count">{data.pagination.totalUsers} total users</span>
            </div>
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
                                <div class="user-info">
                                    <div class="user-avatar">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                    </div>
                                    <div>
                                        <div class="user-name">{getUserDisplayName(user)}</div>
                                        {#if getUserSecondary(user)}
                                            <div class="user-username">{getUserSecondary(user)}</div>
                                        {/if}
                                    </div>
                                </div>
                            </td>
                            <td>{user.email || 'N/A'}</td>
                            <td>
                                <div class="badge-group">
                                    {#if user.is_suspended}
                                        <span class="badge suspended">Suspended</span>
                                    {/if}
                                    {#if user.is_admin}
                                        <span class="badge admin">Admin</span>
                                    {/if}
                                    {#if user.identity_verified}
                                        <span class="badge verified">Verified</span>
                                    {:else}
                                        <span class="badge unverified">Unverified</span>
                                    {/if}
                                </div>
                            </td>
                            <td class="date">{new Date(user.created_at).toLocaleDateString()}</td>
                            <td>
                                <div class="action-menu">
                                    <button class="menu-trigger" onclick={() => toggleMenu('main-' + user.id)} aria-label="Actions">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <circle cx="12" cy="5" r="1"></circle>
                                            <circle cx="12" cy="12" r="1"></circle>
                                            <circle cx="12" cy="19" r="1"></circle>
                                        </svg>
                                    </button>
                                    {#if openMenuId === 'main-' + user.id}
                                        <div class="dropdown-menu">
                                            <form method="POST" action="?/viewClubs" class="menu-form">
                                                <input type="hidden" name="userId" value={user.id} />
                                                <button type="submit" class="menu-item">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                                    </svg>
                                                    View Clubs
                                                </button>
                                            </form>
                                            <form method="POST" action="?/toggleAdmin" class="menu-form">
                                                <input type="hidden" name="userId" value={user.id} />
                                                <input type="hidden" name="isAdmin" value={user.is_admin} />
                                                <button type="submit" class="menu-item">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                        <path d="M12 20h9"></path>
                                                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                                                    </svg>
                                                    {user.is_admin ? 'Demote from Admin' : 'Promote to Admin'}
                                                </button>
                                            </form>
                                            <form method="POST" action="?/loginAs" class="menu-form" onsubmit={(e) => { if (!confirm(`Login as ${user.email}? You will be logged out of your current session.`)) e.preventDefault(); }}>
                                                <input type="hidden" name="userId" value={user.id} />
                                                <button type="submit" class="menu-item">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                                                        <polyline points="10 17 15 12 10 7"></polyline>
                                                        <line x1="15" y1="12" x2="3" y2="12"></line>
                                                    </svg>
                                                    Login as User
                                                </button>
                                            </form>
                                            <div class="menu-divider"></div>
                                            <form method="POST" action="?/clearSessions" class="menu-form">
                                                <input type="hidden" name="userId" value={user.id} />
                                                <button type="submit" class="menu-item warning">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                        <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                                                        <line x1="12" y1="2" x2="12" y2="12"></line>
                                                    </svg>
                                                    End All Sessions
                                                </button>
                                            </form>
                                            {#if user.is_suspended}
                                                <form method="POST" action="?/unsuspend" class="menu-form">
                                                    <input type="hidden" name="userId" value={user.id} />
                                                    <button type="submit" class="menu-item success">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                                        </svg>
                                                        Unsuspend User
                                                    </button>
                                                </form>
                                            {:else}
                                                <button type="button" class="menu-item danger" onclick={() => openSuspendDialog(user.id)}>
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                        <circle cx="12" cy="12" r="10"></circle>
                                                        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
                                                    </svg>
                                                    Suspend User
                                                </button>
                                            {/if}
                                            <form method="POST" action="?/delete" class="menu-form" onsubmit={(e) => { if (!confirm('Delete this user permanently?')) e.preventDefault(); }}>
                                                <input type="hidden" name="userId" value={user.id} />
                                                <button type="submit" class="menu-item danger">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                        <polyline points="3 6 5 6 21 6"></polyline>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                    </svg>
                                                    Delete User
                                                </button>
                                            </form>
                                        </div>
                                    {/if}
                                </div>
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
                    Showing {(data.pagination.page - 1) * data.pagination.perPage + 1} - {Math.min(data.pagination.page * data.pagination.perPage, data.pagination.totalUsers)} of {data.pagination.totalUsers}
                </div>
                <div class="pagination-controls">
                    {#if data.pagination.page > 1}
                        <a href="?page={data.pagination.page - 1}&sort={data.sort}" class="btn btn-secondary btn-small">
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
                                    href="?page={i + 1}&sort={data.sort}" 
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
                        <a href="?page={data.pagination.page + 1}&sort={data.sort}" class="btn btn-secondary btn-small">
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
</div>

<!-- Suspend User Dialog -->
{#if suspendUserId}
    <div class="modal-overlay" onclick={closeSuspendDialog}>
        <div class="modal" onclick={(e) => e.stopPropagation()}>
            <div class="modal-header">
                <h3>Suspend User</h3>
                <button class="modal-close" onclick={closeSuspendDialog}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <form method="POST" action="?/suspend" class="modal-form">
                <input type="hidden" name="userId" value={suspendUserId} />
                <div class="form-group">
                    <label for="suspend-reason">Reason for suspension</label>
                    <textarea 
                        id="suspend-reason"
                        name="reason" 
                        placeholder="Provide a reason for suspending this user..."
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
                    <span>This will immediately log out the user and block their access to the portal.</span>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn btn-secondary" onclick={closeSuspendDialog}>Cancel</button>
                    <button type="submit" class="btn btn-danger">Suspend User</button>
                </div>
            </form>
        </div>
    </div>
{/if}

<!-- View Clubs Modal -->
{#if showClubsModal && form?.viewingClubs}
    <div class="modal-overlay" onclick={closeClubsModal}>
        <div class="modal" onclick={(e) => e.stopPropagation()}>
            <div class="modal-header">
                <h3>Clubs for {form.clubsUser?.name}</h3>
                <button class="modal-close" onclick={closeClubsModal}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <p class="clubs-email">Email: {form.clubsUser?.email}</p>
                
                {#if form.clubsError}
                    <div class="alert alert-error">{form.clubsError}</div>
                {:else if form.clubs?.length > 0}
                    <div class="clubs-list">
                        {#each form.clubs as club}
                            <div class="club-item">
                                <div class="club-icon">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                    </svg>
                                </div>
                                <div class="club-details">
                                    <div class="club-name">{club.name}</div>
                                    <div class="club-location">{club.location}</div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="no-clubs">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                        <p>No clubs found for this user</p>
                    </div>
                {/if}
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary" onclick={closeClubsModal}>Close</button>
            </div>
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

    /* Sections */
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

    .header-actions {
        display: flex;
        align-items: center;
        gap: 16px;
    }

    .sort-dropdown {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .sort-dropdown label {
        font-size: 0.8rem;
        color: #8492a6;
        font-weight: 500;
    }

    .sort-dropdown select {
        padding: 6px 28px 6px 10px;
        font-size: 0.8rem;
        border: 1.5px solid #e0e6ed;
        border-radius: 8px;
        background: white;
        color: #1f2d3d;
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238492a6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 8px center;
        transition: border-color 0.2s, box-shadow 0.2s;
    }

    .sort-dropdown select:hover {
        border-color: #338eda;
    }

    .sort-dropdown select:focus {
        outline: none;
        border-color: #ec3750;
        box-shadow: 0 0 0 3px rgba(236, 55, 80, 0.1);
    }

    .results-count, .total-count {
        font-size: 0.8rem;
        color: #8492a6;
    }

    /* Table */
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
        vertical-align: middle;
    }

    .data-table tr:hover td {
        background: #f9fafc;
    }

    /* User info */
    .user-info {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .user-avatar {
        width: 36px;
        height: 36px;
        background: #e8f0fe;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #338eda;
    }

    .user-name {
        font-weight: 600;
        color: #1f2d3d;
    }

    .user-username {
        font-size: 0.75rem;
        color: #8492a6;
    }

    .date {
        color: #8492a6;
    }

    /* Badges */
    .badge-group {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
    }

    .badge {
        display: inline-flex;
        align-items: center;
        padding: 3px 10px;
        border-radius: 100px;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.03em;
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
        background: #f0f4f8;
        color: #8492a6;
    }

    /* Actions Menu */
    .action-menu {
        position: relative;
        display: inline-block;
    }

    .menu-trigger {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 0;
        background: white;
        border: 1px solid #e0e6ed;
        border-radius: 6px;
        cursor: pointer;
        color: #8492a6;
        transition: all 150ms ease;
    }

    .menu-trigger:hover {
        background: #f9fafc;
        border-color: #338eda;
        color: #338eda;
    }

    .dropdown-menu {
        position: absolute;
        right: 0;
        top: 100%;
        margin-top: 4px;
        min-width: 180px;
        background: white;
        border: 1px solid #e0e6ed;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        z-index: 100;
        padding: 4px 0;
    }

    .menu-form {
        display: block;
    }

    .menu-item {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 10px 14px;
        font-size: 0.8rem;
        font-weight: 500;
        font-family: inherit;
        color: #1f2d3d;
        background: none;
        border: none;
        cursor: pointer;
        text-align: left;
        transition: all 150ms ease;
    }

    .menu-item:hover {
        background: #f9fafc;
    }

    .menu-item.warning {
        color: #ff8c37;
    }

    .menu-item.warning:hover {
        background: #fff7ed;
    }

    .menu-item.danger {
        color: #ec3750;
    }

    .menu-item.danger:hover {
        background: #fef2f2;
    }

    .menu-item.success {
        color: #33d6a6;
    }

    .menu-item.success:hover {
        background: #ecfdf5;
    }

    .menu-divider {
        height: 1px;
        background: #e0e6ed;
        margin: 4px 0;
    }

    .inline-form {
        display: inline;
    }

    .no-results {
        text-align: center;
        color: #8492a6;
        font-style: italic;
        padding: 24px;
    }

    /* Suspended badge */
    .badge.suspended {
        background: #ec3750;
        color: white;
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

    .modal-body {
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

    .form-group textarea {
        width: 100%;
        padding: 12px;
        font-size: 0.9rem;
        font-family: inherit;
        border: 1px solid #e0e6ed;
        border-radius: 8px;
        resize: vertical;
        transition: all 150ms ease;
    }

    .form-group textarea:focus {
        outline: none;
        border-color: #338eda;
        box-shadow: 0 0 0 3px rgba(51, 142, 218, 0.1);
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
        padding: 16px 24px;
        border-top: 1px solid #e0e6ed;
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

    /* Clubs modal */
    .clubs-email {
        font-size: 0.85rem;
        color: #8492a6;
        margin: 0 0 16px 0;
    }

    .clubs-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .club-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: #f9fafc;
        border-radius: 8px;
    }

    .club-icon {
        width: 40px;
        height: 40px;
        background: #e8f0fe;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #338eda;
    }

    .club-details {
        flex: 1;
    }

    .club-name {
        font-weight: 600;
        color: #1f2d3d;
        font-size: 0.9rem;
    }

    .club-location {
        font-size: 0.8rem;
        color: #8492a6;
    }

    .no-clubs {
        text-align: center;
        padding: 32px;
        color: #8492a6;
    }

    .no-clubs svg {
        margin-bottom: 12px;
        opacity: 0.5;
    }

    .no-clubs p {
        margin: 0;
        font-size: 0.9rem;
    }

    @media (max-width: 900px) {
        .admin-page {
            padding: 20px;
        }

        .search-form {
            flex-direction: column;
        }

        .dropdown-menu {
            right: auto;
            left: 0;
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

    .btn-small {
        padding: 6px 12px;
        font-size: 0.8rem;
    }
</style>
