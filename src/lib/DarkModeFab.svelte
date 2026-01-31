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
        class="dark-mode-fab" 
        class:dark={isDark}
        onclick={toggle}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
        <div class="icon-wrapper">
            <!-- Sun -->
            <svg class="sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
            <svg class="moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
        </div>
    </button>
{/if}

<style>
    .dark-mode-fab {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: white;
        border: 1px solid #e0e6ed;
        border-radius: 50%;
        color: #3c4858;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
        z-index: 1000;
        overflow: hidden;
    }

    .dark-mode-fab:hover {
        background: #f9fafc;
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
    }

    .icon-wrapper {
        position: relative;
        width: 20px;
        height: 20px;
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

    .dark-mode-fab.dark .sun {
        opacity: 0;
        transform: rotate(90deg) scale(0.5);
    }

    .dark-mode-fab.dark .moon {
        opacity: 1;
        transform: rotate(0deg) scale(1);
    }

    @media (max-width: 768px) {
        .dark-mode-fab {
            bottom: 16px;
            right: 16px;
            width: 44px;
            height: 44px;
        }
    }

    /* Safe area support for iOS */
    @supports (padding: max(0px)) {
        .dark-mode-fab {
            bottom: max(24px, calc(env(safe-area-inset-bottom) + 16px));
            right: max(24px, calc(env(safe-area-inset-right) + 16px));
        }
        
        @media (max-width: 768px) {
            .dark-mode-fab {
                bottom: max(16px, calc(env(safe-area-inset-bottom) + 12px));
                right: max(16px, calc(env(safe-area-inset-right) + 12px));
            }
        }
    }
</style>
