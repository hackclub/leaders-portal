<script>
    let { data } = $props();
</script>

<div class="suspended-page">
    <div class="suspended-card">
        <div class="icon-container">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
            </svg>
        </div>
        
        <h1>Account Suspended</h1>
        
        <p class="message">
            Your account has been suspended and you cannot access the Club Portal at this time.
        </p>
        
        {#if data.reason}
            <div class="reason-box">
                <span class="reason-label">Reason:</span>
                <p class="reason-text">{data.reason}</p>
            </div>
        {/if}
        
        {#if data.suspendedAt}
            <p class="suspended-date">
                Suspended on {new Date(data.suspendedAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}
            </p>
        {/if}
        
        <div class="contact-info">
            <p>If you believe this is a mistake or would like to appeal, please contact:</p>
            <a href="mailto:clubs@hackclub.com" class="contact-link">clubs@hackclub.com</a>
        </div>
        
        <div class="actions">
            <a href="/logout" class="btn btn-secondary">Log Out</a>
        </div>
    </div>
</div>

<style>
    .suspended-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #1f2d3d;
        padding: 20px;
    }

    .suspended-card {
        background: white;
        border-radius: 16px;
        padding: 48px;
        max-width: 480px;
        width: 100%;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .icon-container {
        width: 100px;
        height: 100px;
        background: #ec3750;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 24px;
        color: white;
    }

    h1 {
        font-size: 1.75rem;
        font-weight: 700;
        color: #1f2d3d;
        margin: 0 0 16px 0;
    }

    .message {
        font-size: 1rem;
        color: #8492a6;
        margin: 0 0 24px 0;
        line-height: 1.6;
    }

    .reason-box {
        background: #fef2f2;
        border: 1px solid #fed7d7;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 20px;
        text-align: left;
    }

    .reason-label {
        font-size: 0.75rem;
        font-weight: 600;
        color: #ec3750;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .reason-text {
        font-size: 0.9rem;
        color: #1f2d3d;
        margin: 8px 0 0 0;
        line-height: 1.5;
    }

    .suspended-date {
        font-size: 0.85rem;
        color: #8492a6;
        margin: 0 0 24px 0;
    }

    .contact-info {
        background: #f9fafc;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 24px;
    }

    .contact-info p {
        font-size: 0.85rem;
        color: #8492a6;
        margin: 0 0 8px 0;
    }

    .contact-link {
        font-size: 0.9rem;
        font-weight: 600;
        color: #338eda;
        text-decoration: none;
    }

    .contact-link:hover {
        text-decoration: underline;
    }

    .actions {
        display: flex;
        justify-content: center;
    }

    .btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
        font-size: 0.9rem;
        font-weight: 600;
        font-family: inherit;
        border-radius: 8px;
        cursor: pointer;
        transition: all 150ms ease;
        text-decoration: none;
        border: none;
    }

    .btn-secondary {
        background: #f0f4f8;
        color: #1f2d3d;
    }

    .btn-secondary:hover {
        background: #e0e6ed;
    }

    @media (max-width: 500px) {
        .suspended-card {
            padding: 32px 24px;
        }

        h1 {
            font-size: 1.5rem;
        }
    }
</style>
