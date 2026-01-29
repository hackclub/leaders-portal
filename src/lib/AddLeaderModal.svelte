<script>
    import Modal from './Modal.svelte';
    
    let { open = false, onClose } = $props();
    
    let clubs = $state([]);
    let selectedClubId = $state('');
    let isLoading = $state(false);
    let isSubmitting = $state(false);
    let error = $state(null);
    let result = $state(null);

    $effect(() => {
        if (open) {
            fetchClubs();
            selectedClubId = '';
            error = null;
            result = null;
        }
    });

    async function fetchClubs() {
        isLoading = true;
        error = null;
        try {
            const response = await fetch('/api/admin/clubs');
            if (!response.ok) {
                throw new Error('Failed to fetch clubs');
            }
            clubs = await response.json();
        } catch (err) {
            error = err.message;
        } finally {
            isLoading = false;
        }
    }

    async function handleSubmit() {
        if (!selectedClubId || isSubmitting) return;
        
        isSubmitting = true;
        error = null;
        
        try {
            const response = await fetch('/api/admin/leaders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clubId: selectedClubId })
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create leader');
            }
            
            const data = await response.json();
            result = data.updateLeaderInfoForm;
        } catch (err) {
            error = err.message;
        } finally {
            isSubmitting = false;
        }
    }

    function handleClose() {
        result = null;
        onClose?.();
    }
</script>

<Modal {open} title="Add Leader" onClose={handleClose}>
    {#if result}
        <div class="success-container">
            <p class="success-label">Leader created! Share this form link:</p>
            <div class="form-link">
                <a href={result} target="_blank" rel="noopener noreferrer">{result}</a>
            </div>
            <button class="btn-primary" onclick={handleClose}>Done</button>
        </div>
    {:else}
        <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <label for="club-select">Select Club</label>
            {#if isLoading}
                <p class="loading">Loading clubs...</p>
            {:else}
                <select id="club-select" bind:value={selectedClubId} required disabled={isSubmitting}>
                    <option value="">-- Select a club --</option>
                    {#each clubs as club}
                        <option value={club.id}>{club.name}</option>
                    {/each}
                </select>
            {/if}
            
            {#if error}
                <p class="error">{error}</p>
            {/if}
            
            <button type="submit" class="btn-primary" disabled={!selectedClubId || isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Add Leader'}
            </button>
        </form>
    {/if}
</Modal>

<style>
    form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    label {
        font-weight: 500;
        color: #1f2d3d;
    }

    select {
        padding: 0.75rem;
        border: 2px solid #e0e6ed;
        border-radius: 8px;
        font-size: 1rem;
        font-family: 'Phantom Sans', system-ui, sans-serif;
        background: white;
    }

    select:focus {
        outline: none;
        border-color: #338eda;
    }

    select:disabled {
        background: #f9fafc;
        cursor: not-allowed;
    }

    .btn-primary {
        padding: 0.75rem 1rem;
        background: #ec3750;
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 500;
        font-size: 1rem;
        cursor: pointer;
        font-family: 'Phantom Sans', system-ui, sans-serif;
    }

    .btn-primary:hover:not(:disabled) {
        background: #d32f44;
    }

    .btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .loading {
        color: #8492a6;
        font-size: 0.875rem;
    }

    .error {
        color: #ec3750;
        font-size: 0.875rem;
        margin: 0;
    }

    .success-container {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .success-label {
        color: #33d6a6;
        font-weight: 500;
        margin: 0;
    }

    .form-link {
        padding: 0.75rem;
        background: #f9fafc;
        border: 1px solid #e0e6ed;
        border-radius: 8px;
        word-break: break-all;
    }

    .form-link a {
        color: #338eda;
        text-decoration: none;
    }

    .form-link a:hover {
        text-decoration: underline;
    }
</style>
