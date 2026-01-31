<script>
    let { data } = $props();
</script>

<div class="admin-page">
    <div class="page-header">
        <a href="/admin/clubs/{encodeURIComponent(data.club.name)}" class="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5"></path>
                <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Club
        </a>
        <h1>Members of {data.club.name}</h1>
        <p class="header-subtitle">View all registered members of this club</p>
    </div>

    <section class="data-section">
        <div class="section-header">
            <h2>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                Club Members
            </h2>
            <span class="total-count">{data.members.length} members</span>
        </div>

        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                    </tr>
                </thead>
                <tbody>
                    {#if data.members.length === 0}
                        <tr>
                            <td colspan="4" class="empty-state">No members found in this club.</td>
                        </tr>
                    {:else}
                        {#each data.members as member}
                            <tr>
                                <td>
                                    <div class="member-info">
                                        <div class="member-avatar">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="12" cy="7" r="4"></circle>
                                            </svg>
                                        </div>
                                        <div>
                                            <div class="member-name">{member.first_name} {member.last_name}</div>
                                            {#if member.username}
                                                <div class="member-username">@{member.username}</div>
                                            {/if}
                                        </div>
                                    </div>
                                </td>
                                <td>{member.email || 'N/A'}</td>
                                <td>
                                    <span class="badge role">{member.role}</span>
                                </td>
                                <td class="date">
                                    {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : 'N/A'}
                                </td>
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
        </div>
    </section>
</div>

<style>
    .admin-page {
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

    .data-section {
        background: white;
        border: 1px solid #e0e6ed;
        border-radius: 12px;
        padding: 20px;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    }

    .section-header h2 {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 1rem;
        font-weight: 700;
        color: #1f2d3d;
        margin: 0;
    }

    .section-header h2 svg {
        color: #338eda;
    }

    .total-count {
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
        vertical-align: middle;
    }

    .data-table tr:hover td {
        background: #f9fafc;
    }

    .member-info {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .member-avatar {
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #f0f4ff 0%, #e0e8ff 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #338eda;
    }

    .member-name {
        font-weight: 600;
        color: #1f2d3d;
    }

    .member-username {
        font-size: 0.75rem;
        color: #8492a6;
    }

    .date {
        color: #8492a6;
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

    .badge.role {
        background: #338eda;
        color: white;
    }

    .empty-state {
        text-align: center;
        color: #8492a6;
        font-style: italic;
        padding: 24px;
    }

    @media (max-width: 900px) {
        .admin-page {
            padding: 20px;
        }
    }
</style>
