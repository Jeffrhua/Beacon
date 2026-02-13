<script lang="ts">
  import { Sidebar, SidebarGroup, SidebarItem, Input, Label, Button, Textarea, PhoneInput } from "flowbite-svelte";
  import { KeyboardSolid, LockSolid, UserSolid, InfoCircleSolid, CloseCircleSolid, EyeSolid } from "flowbite-svelte-icons";
  import { onMount } from 'svelte';
  import { client } from "$lib/auth-client";
  import { goto } from "$app/navigation";
  import { theme } from "$lib/stores/theme.js";
  
  const { data } = $props();
  const user = data.user ?? { displayName: "", name: "", profileDescription: "", phoneNumber: "" };

  let currentSection = $state<"profile" | "accessibility" | "security" | "terms" | "appearance">("profile");
  
  let fontSize = $state<'small' | 'medium' | 'large' | 'xlarge'>('medium');
  let themeBtn = $state("light");
  let highContrast = $state<boolean>(false);
  let focusIndicators = $state<boolean>(true);
  let dyslexiaFont = $state<boolean>(false);
  let textToSpeech = $state<boolean>(false);

  let speechSynthesis: SpeechSynthesis | null = null;
  let isReading = $state(false);

  onMount(() => {
    fontSize = (localStorage.getItem('fontSize') as any) || 'medium';
    highContrast = localStorage.getItem('highContrast') === 'true';
    focusIndicators = localStorage.getItem('focusIndicators') !== 'false';
    dyslexiaFont = localStorage.getItem('dyslexiaFont') === 'true';
    textToSpeech = localStorage.getItem('textToSpeech') === 'true';
    themeBtn = $theme
    
    applyFontSize();
    applyTheme();
    applyHighContrast();
    applyFocusIndicators();
    applyDyslexiaFont();
    applyTextToSpeech();

    // Initialize speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis = window.speechSynthesis;
    }
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
    theme.set(themeBtn)
  }
  
  function applyHighContrast() {
    if (highContrast) {
      document.documentElement.setAttribute('data-contrast', 'high');
    } else {
      document.documentElement.removeAttribute('data-contrast');
    }
    localStorage.setItem('highContrast', highContrast.toString());
  }

  function applyFocusIndicators() {
    if (focusIndicators) {
      document.documentElement.setAttribute('data-focus-indicators', 'enabled');
    } else {
      document.documentElement.removeAttribute('data-focus-indicators');
    }
    localStorage.setItem('focusIndicators', focusIndicators.toString());
  }

  function applyDyslexiaFont() {
    if (dyslexiaFont) {
      document.documentElement.setAttribute('data-dyslexia-font', 'enabled');
    } else {
      document.documentElement.removeAttribute('data-dyslexia-font');
    }
    localStorage.setItem('dyslexiaFont', dyslexiaFont.toString());
  }

  function applyTextToSpeech() {
    if (textToSpeech) {
      document.documentElement.setAttribute('data-text-to-speech', 'enabled');
      enableTextToSpeech();
    } else {
      document.documentElement.removeAttribute('data-text-to-speech');
      disableTextToSpeech();
    }
    localStorage.setItem('textToSpeech', textToSpeech.toString());
  }

  function enableTextToSpeech() {
    if (typeof window === 'undefined') return;
    
    // Add click listeners to all text elements
    document.addEventListener('click', handleTextClick);
  }

  function disableTextToSpeech() {
    if (typeof window === 'undefined') return;
    
    document.removeEventListener('click', handleTextClick);
    
    // Stop any ongoing speech
    if (speechSynthesis) {
      speechSynthesis.cancel();
      isReading = false;
    }
  }

  function handleTextClick(event: MouseEvent) {
    if (!textToSpeech || !speechSynthesis) return;
    
    const target = event.target as HTMLElement;
    
    // Only read text from paragraphs, headings, labels, buttons, and links
    if (target.matches('p, h1, h2, h3, h4, h5, h6, label, button, a, span, li')) {
      const text = target.textContent?.trim();
      
      if (text) {
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        // Create and speak new utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9; // Slightly slower for better comprehension
        utterance.pitch = 1.0;
        
        utterance.onstart = () => {
          isReading = true;
          target.style.backgroundColor = 'rgba(251, 191, 36, 0.3)';
        };
        
        utterance.onend = () => {
          isReading = false;
          target.style.backgroundColor = '';
        };
        
        speechSynthesis.speak(utterance);
      }
    }
  }

  async function handleSignOut(){
    await client.signOut({
      fetchOptions:{
        onSuccess: () => {goto("/sign-in")}
      }
    })
  }
</script>



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
      <SidebarItem label="Logout" onclick={handleSignOut} class="cursor-pointer">
        {#snippet icon()}
          <CloseCircleSolid class="shrink-0 h-6 w-6" />
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
        
        <!-- Focus Indicators -->
        <div>
          <h2 class="text-xl font-semibold mb-4">Focus Indicators</h2>
          <p class="text-gray-600 mb-4">Enhanced visual indicators when navigating with keyboard</p>
          <div class="space-y-2">
            <Label class="flex items-center space-x-3 cursor-pointer p-3 hover:bg-gray-50 rounded">
              <input 
                type="checkbox" 
                bind:checked={focusIndicators} 
                onchange={applyFocusIndicators}
                class="w-4 h-4"
              />
              <span>Enable Enhanced Focus Indicators</span>
            </Label>
            <p class="text-sm text-gray-500 ml-7">Shows clear outlines around buttons and links when using Tab key</p>
          </div>
        </div>

        <!-- Dyslexia-Friendly Font -->
        <div>
          <h2 class="text-xl font-semibold mb-4">Dyslexia-Friendly Font</h2>
          <p class="text-gray-600 mb-4">Switch to a font designed for easier reading</p>
          <div class="space-y-2">
            <Label class="flex items-center space-x-3 cursor-pointer p-3 hover:bg-gray-50 rounded">
              <input 
                type="checkbox" 
                bind:checked={dyslexiaFont} 
                onchange={applyDyslexiaFont}
                class="w-4 h-4"
              />
              <span>Enable Dyslexia-Friendly Font</span>
            </Label>
            <p class="text-sm text-gray-500 ml-7">Uses OpenDyslexic font with weighted bottoms to help prevent confusion</p>
          </div>
        </div>

        <!-- Text-to-Speech -->
        <div>
          <h2 class="text-xl font-semibold mb-4">Text-to-Speech</h2>
          <p class="text-gray-600 mb-4">Click on any text to hear it read aloud</p>
          <div class="space-y-2">
            <Label class="flex items-center space-x-3 cursor-pointer p-3 hover:bg-gray-50 rounded">
              <input 
                type="checkbox" 
                bind:checked={textToSpeech} 
                onchange={applyTextToSpeech}
                class="w-4 h-4"
              />
              <span>Enable Text-to-Speech</span>
            </Label>
            <p class="text-sm text-gray-500 ml-7">Click on headings, paragraphs, or buttons to have them read aloud</p>
            {#if isReading}
              <p class="text-sm text-green-600 ml-7 font-semibold">🔊 Reading...</p>
            {/if}
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