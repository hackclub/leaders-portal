<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    
    let isDark = $state(false);
    let mounted = $state(false);
    
    onMount(async () => {
        const saved = localStorage.getItem('darkMode');
        if (saved !== null) {
            isDark = saved === 'true';
        } else {
            isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        
        const DarkReader = await import('darkreader');
        
        if (isDark) {
            DarkReader.enable({
                brightness: 100,
                contrast: 90,
                sepia: 10
            });
        }
        
        mounted = true;
    });
    
    async function toggle() {
        isDark = !isDark;
        localStorage.setItem('darkMode', isDark.toString());
        
        const DarkReader = await import('darkreader');
        
        if (isDark) {
            DarkReader.enable({
                brightness: 100,
                contrast: 90,
                sepia: 10
            });
        } else {
            DarkReader.disable();
        }
    }
</script>

{#if mounted}
    <button 
        class="dark-mode-toggle" 
        class:dark={isDark}
        onclick={toggle}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
        <div class="icon-wrapper">
            <!-- Sun -->
            <svg class="sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <!-- Moon -->
            <svg class="moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
        </div>
    </button>
{/if}

<style>
    .dark-mode-toggle {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: 1px solid #e0e6ed;
        border-radius: 10px;
        color: #3c4858;
        cursor: pointer;
        transition: all 0.2s ease;
        overflow: hidden;
    }

    .dark-mode-toggle:hover {
        background: #f9fafc;
        border-color: #d0d6dd;
    }

    .icon-wrapper {
        position: relative;
        width: 18px;
        height: 18px;
    }

    .sun, .moon {
        position: absolute;
        top: 0;
        left: 0;
        transition: all 0.3s ease;
    }

    .sun {
        opacity: 1;
        transform: rotate(0deg) scale(1);
    }

    .moon {
        opacity: 0;
        transform: rotate(-90deg) scale(0.5);
    }

    .dark-mode-toggle.dark .sun {
        opacity: 0;
        transform: rotate(90deg) scale(0.5);
    }

    .dark-mode-toggle.dark .moon {
        opacity: 1;
        transform: rotate(0deg) scale(1);
    }
</style>
