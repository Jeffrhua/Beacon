<script lang="ts">
  import { Sidebar, SidebarGroup, SidebarItem, Input, Label, Button, Textarea, PhoneInput } from "flowbite-svelte";
  import { KeyboardSolid, LockSolid, UserSolid, InfoCircleSolid, CloseCircleSolid, CogSolid, EyeSolid } from "flowbite-svelte-icons";
  import { onMount } from 'svelte';
  import { themeState } from "$lib/states/theme.svelte.js";
  
  const { data } = $props();
  const user = data.user ?? { displayName: "", name: "", profileDescription: "", phoneNumber: "" };

  let currentSection = $state<"profile" | "accessibility" | "security" | "terms" | "appearance">("profile");
  
  let fontSize = $state<'small' | 'medium' | 'large' | 'xlarge'>('medium');
  let theme = $state<'light' | 'dark'>('light');
  let highContrast = $state<boolean>(false);

  onMount(() => {
    fontSize = (localStorage.getItem('fontSize') as any) || 'medium';
    theme = (localStorage.getItem('theme') as any) || 'light';
    highContrast = localStorage.getItem('highContrast') === 'true';
    
    applyFontSize();
    applyTheme();
    applyHighContrast();
  });

  function applyFontSize() {
    const sizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '22px'
    };
    document.documentElement.style.fontSize = sizes[fontSize];
    localStorage.setItem('fontSize', fontSize);
  }

  function applyTheme() {
    themeState.value = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }
  
  function applyHighContrast() {
    if (highContrast) {
      document.documentElement.setAttribute('data-contrast', 'high');
    } else {
      document.documentElement.removeAttribute('data-contrast');
    }
    localStorage.setItem('highContrast', highContrast.toString());
  }
</script>

<div class="w-full flex items-center justify-between px-4 py-3 border-b bg-gray-50">
  <a href="/" class="inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700">
    <CloseCircleSolid class="h-6 w-6" />
  </a>

  <div class="flex-1 flex justify-center gap-2 items-center pointer-events-none">
    <CogSolid class="shrink-0 h-6 w-6" />
    <h1 class="text-lg font-semibold">Settings</h1>
  </div>
</div>

<div class="relative">
  <Sidebar backdrop={false} params={{ x: -50, duration: 50 }} class="z-50 h-full" position="absolute" classes={{ nonactive: "p-2", active: "p-2" }}>
    <SidebarGroup>
      <SidebarItem label="Profile" onclick={() => currentSection = "profile"} class="cursor-pointer">
        {#snippet icon()}
          <UserSolid class="shrink-0 h-6 w-6 " />
        {/snippet}
      </SidebarItem>
      <SidebarItem label="Appearance" onclick={() => currentSection = "appearance"} class="cursor-pointer">
        {#snippet icon()}
          <EyeSolid class="shrink-0 h-6 w-6" />
        {/snippet}
      </SidebarItem>
      <SidebarItem label="Accesibility" onclick={() => currentSection = "accessibility"} class="cursor-pointer">
        {#snippet icon()}
          <KeyboardSolid class="shrink-0 h-6 w-6" />
        {/snippet}
      </SidebarItem>
      <SidebarItem label="Security" onclick={() => currentSection = "security"} class="cursor-pointer">
        {#snippet icon()}
          <LockSolid class="shrink-0 h-6 w-6" />
        {/snippet}
      </SidebarItem>
      <SidebarItem label="Terms of service" onclick={() => currentSection = "terms"} class="cursor-pointer">
        {#snippet icon()}
          <InfoCircleSolid class="shrink-0 h-6 w-6" />
        {/snippet}
      </SidebarItem>
    </SidebarGroup>
  </Sidebar>
  
  <div class="px-4 md:ml-64">
    <div class="rounded-lg border-2 border-dashed border-gray-200 p-4 dark:border-gray-700">
      
      {#if currentSection === "profile"}
      <form method="POST" action="?/updateProfile">
        <div class="mb-6 grid gap-4">
          <div class="flex flex-col">
            <Label for="display_name" class="mb-2">Display Name</Label>
            <Input type="text" name="display_name" value={user.displayName ?? user.name} required />
          </div>
          <div class="flex flex-col">
            <Label for="profile_description" class="mb-2">Profile Description</Label>
            <Textarea name="profile_description" rows={4} value={user.profileDescription} class="w-full"/>
          </div>
          <div class="flex flex-col">
            <Label for="phone_number" class="mb-2">Phone Number</Label>
            <PhoneInput name="phone_number" defaultValue={user.phoneNumber} placeholder="123-456-7890"/>
          </div>
        </div>
        <Button type="submit">Save Changes</Button>
      </form>
      {/if}
      
      {#if currentSection === "accessibility"}
      <div class="space-y-6">
        <!-- Font Size -->
        <div>
          <h2 class="text-xl font-semibold mb-4">Font Size</h2>
          <p class="text-gray-600 mb-4">Adjust the text size across the application</p>
          <div class="space-y-2">
            <Label class="flex items-center space-x-3 cursor-pointer p-3 hover:bg-gray-50 rounded">
              <input type="radio" bind:group={fontSize} value="small" onchange={applyFontSize} class="w-4 h-4" />
              <span>Small</span>
            </Label>
            <Label class="flex items-center space-x-3 cursor-pointer p-3 hover:bg-gray-50 rounded">
              <input type="radio" bind:group={fontSize} value="medium" onchange={applyFontSize} class="w-4 h-4" />
              <span>Medium (Default)</span>
            </Label>
            <Label class="flex items-center space-x-3 cursor-pointer p-3 hover:bg-gray-50 rounded">
              <input type="radio" bind:group={fontSize} value="large" onchange={applyFontSize} class="w-4 h-4" />
              <span>Large</span>
            </Label>
            <Label class="flex items-center space-x-3 cursor-pointer p-3 hover:bg-gray-50 rounded">
              <input type="radio" bind:group={fontSize} value="xlarge" onchange={applyFontSize} class="w-4 h-4" />
              <span>Extra Large</span>
            </Label>
          </div>
        </div>
        
        <!-- Theme -->
        <div>
          <h2 class="text-xl font-semibold mb-4">Theme</h2>
          <p class="text-gray-600 mb-4">Choose between light and dark mode</p>
          <div class="space-y-2">
            <Label class="flex items-center space-x-3 cursor-pointer p-3 hover:bg-gray-50 rounded">
              <input type="radio" bind:group={theme} value="light" onchange={applyTheme} class="w-4 h-4" />
              <span>Light Mode</span>
            </Label>
            <Label class="flex items-center space-x-3 cursor-pointer p-3 hover:bg-gray-50 rounded">
              <input type="radio" bind:group={theme} value="dark" onchange={applyTheme} class="w-4 h-4" />
              <span>Dark Mode</span>
            </Label>
          </div>
        </div>
        
        <!-- High Contrast -->
        <div>
          <h2 class="text-xl font-semibold mb-4">UI Contrast</h2>
          <p class="text-gray-600 mb-4">Increase color contrast for better visibility</p>
          <div class="space-y-2">
            <Label class="flex items-center space-x-3 cursor-pointer p-3 hover:bg-gray-50 rounded">
              <input 
                type="checkbox" 
                bind:checked={highContrast} 
                onchange={applyHighContrast}
                class="w-4 h-4"
              />
              <span>Enable High Contrast Mode</span>
            </Label>
            <p class="text-sm text-gray-500 ml-7">Makes text darker and borders more visible for easier reading</p>
          </div>
        </div>
      </div>
      {/if}
      
      {#if currentSection === "security"}
      <form method="POST" action="?/deleteAccount">
        <div class="mb-6 grid gap-4">
          <Button type="submit">Delete Account</Button>
        </div>
      </form>
      {/if}
      
    </div>
  </div>
</div>