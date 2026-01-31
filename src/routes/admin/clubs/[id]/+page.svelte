<script>
    let { data } = $props();
</script>

<div class="club-detail-page">
    <header class="page-header">
        <div class="header-content">
            <a href="/admin/clubs" class="back-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"/>
                    <polyline points="12 19 5 12 12 5"/>
                </svg>
                Back to Clubs
            </a>
            <h1>{data.club.name}</h1>
        </div>
    </header>

    <!-- Stats Cards -->
    <section class="stats-section">
        <div class="stats-grid">
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
                    <span class="stat-value">{data.club.members.length}</span>
                    <span class="stat-label">Members</span>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon ships">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <span class="stat-value">{data.club.ships.length}</span>
                    <span class="stat-label">Ships</span>
                </div>
            </div>

            <div class="stat-card">
                <div class="stat-icon programs">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <span class="stat-value">{data.club.topYsws.length}</span>
                    <span class="stat-label">YSWS Programs</span>
                </div>
            </div>
        </div>
    </section>

    <div class="content-grid">
        <!-- Members Panel -->
        <section class="data-panel">
            <div class="panel-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <h2>Members ({data.club.members.length})</h2>
            </div>
            <div class="table-wrapper">
                {#if data.club.members.length === 0}
                    <div class="empty-state">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                        </svg>
                        <p>No members found</p>
                    </div>
                {:else}
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each data.club.members as member}
                                <tr>
                                    <td class="name-cell">{member.name}</td>
                                    <td class="email-cell">{member.email}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                {/if}
            </div>
        </section>

        <!-- YSWS Programs Panel -->
        <section class="data-panel">
            <div class="panel-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <h2>YSWS Programs</h2>
            </div>
            <div class="ysws-list">
                {#if data.club.topYsws.length === 0}
                    <div class="empty-state">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                        <p>No ships yet</p>
                    </div>
                {:else}
                    {#each data.club.topYsws as ysws}
                        <div class="ysws-item">
                            <span class="ysws-name">{ysws.name}</span>
                            <span class="ysws-count">{ysws.count} ships</span>
                        </div>
                    {/each}
                {/if}
            </div>
        </section>
    </div>

    <!-- Ships Table -->
    <section class="data-panel full-width">
        <div class="panel-header">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            <h2>Ships ({data.club.ships.length})</h2>
        </div>
        <div class="table-wrapper">
            {#if data.club.ships.length === 0}
                <div class="empty-state">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <p>No ships yet</p>
                </div>
            {:else}
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Project</th>
                            <th>Member</th>
                            <th>Code</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each data.club.ships as ship}
                            <tr>
                                <td class="name-cell">{ship.name}</td>
                                <td>{ship.memberName}</td>
                                <td>
                                    {#if ship.codeUrl}
                                        <a href={ship.codeUrl} target="_blank" rel="noopener" class="link">
                                            View Code
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                                <polyline points="15 3 21 3 21 9"/>
                                                <line x1="10" y1="14" x2="21" y2="3"/>
                                            </svg>
                                        </a>
                                    {:else}
                                        <span class="muted">No link</span>
                                    {/if}
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {/if}
        </div>
    </section>
</div>

<style>
    .club-detail-page {
        max-width: 1200px;
        margin: 0 auto;
        padding: 32px;
    }

    .page-header {
        margin-bottom: 32px;
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
        transition: color 150ms ease;
    }

    .back-link:hover {
        color: #ec3750;
    }

    h1 {
        font-size: 1.75rem;
        font-weight: 700;
        color: #1f2d3d;
        margin: 0;
    }

    h2 {
        font-size: 0.9rem;
        font-weight: 600;
        color: #1f2d3d;
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

    .stat-icon.members {
        background: #fef3f2;
        color: #ec3750;
    }

    .stat-icon.ships {
        background: #fefce8;
        color: #ca8a04;
    }

    .stat-icon.programs {
        background: #f0f4ff;
        color: #338eda;
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

    /* Content Grid */
    .content-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
    }

    .data-panel {
        background: white;
        border: 1px solid #e0e6ed;
        border-radius: 12px;
        overflow: hidden;
    }

    .data-panel.full-width {
        grid-column: 1 / -1;
    }

    .panel-header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 16px 20px;
        border-bottom: 1px solid #f0f4f8;
        color: #8492a6;
    }

    .table-wrapper {
        max-height: 400px;
        overflow-y: auto;
    }

    .data-table {
        width: 100%;
        border-collapse: collapse;
    }

    .data-table th {
        text-align: left;
        padding: 12px 16px;
        font-size: 0.7rem;
        font-weight: 600;
        color: #8492a6;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 1px solid #e0e6ed;
        background: #f9fafc;
        position: sticky;
        top: 0;
    }

    .data-table td {
        padding: 12px 16px;
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

    .name-cell {
        font-weight: 500;
    }

    .email-cell {
        color: #8492a6;
    }

    .link {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: #338eda;
        text-decoration: none;
        font-weight: 500;
    }

    .link:hover {
        text-decoration: underline;
    }

    .muted {
        color: #8492a6;
    }

    /* YSWS List */
    .ysws-list {
        padding: 8px 0;
    }

    .ysws-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 20px;
        border-bottom: 1px solid #f0f4f8;
    }

    .ysws-item:last-child {
        border-bottom: none;
    }

    .ysws-name {
        font-weight: 500;
        color: #1f2d3d;
    }

    .ysws-count {
        font-size: 0.75rem;
        font-weight: 600;
        color: white;
        background: #ff8c37;
        padding: 4px 10px;
        border-radius: 100px;
    }

    /* Empty State */
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        color: #8492a6;
        gap: 12px;
    }

    .empty-state p {
        margin: 0;
        font-style: italic;
    }

    /* Responsive */
    @media (max-width: 900px) {
        .club-detail-page {
            padding: 20px;
        }

        .stats-grid {
            grid-template-columns: 1fr;
        }

        .content-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
