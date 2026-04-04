<script lang="ts">
  import { Toggle, Sidebar, SidebarGroup, SidebarItem, Input, Label, Button, Textarea, PhoneInput } from "flowbite-svelte";
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



<div class="relative min-h-screen">
  <div class="md:hidden px-4 py-3 mb-6 border-b border-gray-700" style="background-color: #17191C;">
      <select 
          class="w-full px-3 py-2 rounded-lg border border-gray-600 dark:bg-gray-800 dark:text-white"
          onchange={(e) => currentSection = e.target.value}
          value={currentSection}
      >
          <option value="profile">Profile</option>
          <option value="appearance">Appearance</option>
          <option value="accessibility">Accessibility</option>
          <option value="security">Privacy & Security</option>
          <option value="terms">Terms of Service</option>
      </select>
    <button onclick={handleSignOut} class="w-full mt-2 py-2 rounded-lg text-red-400 border !border-red-800 text-sm !bg-transparent">
        Logout
    </button>
  </div>
<div class="hidden md:block">
  <Sidebar backdrop={false} params={{ x: -50, duration: 50 }} class="z-50 absolute left-0 top-0 bottom-0 w-64 dark:bg-[#17191C]!" position="absolute" classes={{ nonactive: "p-2", active: "p-2" }}>
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
      <SidebarItem label="Privacy & Security" onclick={() => currentSection = "security"} class="cursor-pointer">
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
</div>
  
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
            <Label class="flex items-center space-x-3 cursor-pointer p-3 dark:hover:bg-[#222326] rounded">
              <input type="radio" bind:group={fontSize} value="small" onchange={applyFontSize} class="w-4 h-4" />
              <span>Small</span>
            </Label>
            <Label class="flex items-center space-x-3 cursor-pointer p-3 dark:hover:bg-[#222326] rounded">
              <input type="radio" bind:group={fontSize} value="medium" onchange={applyFontSize} class="w-4 h-4" />
              <span>Medium (Default)</span>
            </Label>
            <Label class="flex items-center space-x-3 cursor-pointer p-3 dark:hover:bg-[#222326] rounded">
              <input type="radio" bind:group={fontSize} value="large" onchange={applyFontSize} class="w-4 h-4" />
              <span>Large</span>
            </Label>
            <Label class="flex items-center space-x-3 cursor-pointer p-3 dark:hover:bg-[#222326] rounded">
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
            <Label class="flex items-center space-x-3 cursor-pointer p-3 dark:hover:bg-[#222326] rounded">
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
            <Label class="flex items-center space-x-3 cursor-pointer p-3 dark:hover:bg-[#222326] rounded">
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
            <Label class="flex items-center space-x-3 cursor-pointer p-3 dark:hover:bg-[#222326] rounded">
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
        <h2 class="text-xl font-semibold mb-2">Privacy</h2>

        <div class="mb-6">
        <p class="text-lg font-medium mb-2">Location Sharing</p>
        <p class="text-gray-600 mb-3">Control whether your location is shared with friends.</p>
          <Toggle 
            checked={user.locationSharing ?? true}
            name="location_sharing"
            onchange={async (e) => {
              const formData = new FormData();
              formData.append("location_sharing", e.target.checked ? "on" : "off");
              await fetch("?/updatePrivacy", {
                method: "POST",
                body: formData,
              });
            }}
            >Share your location with friends</Toggle>
        </div>
      
        <h3 class="font-semibold mb-2">Alerts</h3>
        <p class="text-gray-600 mb-3">Control whether your name is shown when you submit an alert.</p>
        <Toggle
          checked={user.anonymousAlerts ?? false}
          name="anonymous_alerts"
          onchange={async (e) => {
            const formData = new FormData();
            formData.append("location_sharing", (user.locationSharing ?? true) ? "on" : "off");
            formData.append("anonymous_alerts", e.target.checked ? "on" : "off");
            await fetch("?/updatePrivacy", { method: "POST", body: formData });
          }}
        >Submit alerts anonymously</Toggle>

        <hr class="my-6 border-gray-700" />
        <form method="POST" action="?/deleteAccount">
        <div class="mb-6 grid gap-4">
          <Button type="submit">Delete Account</Button>
        </div>
      </form>

      {/if}

      {#if currentSection === "terms"}
      <div class="space-y-6">
        <div>
          <h2 class="text-xl font-semibold mb-2">Terms of Service</h2>
          <p class="text-gray-600 mb-4">Last updated: March 2026</p>
        </div>

        <div class="overflow-y-auto max-h-96 space-y-4 pr-2 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <h3 class="font-semibold text-gray-800 dark:text-white mb-1">1. Service description</h3>
            <p>Beacon is a community emergency alert platform that enables users to send, receive, and respond to emergency alerts in real time. The platform is provided as-is, and no guarantees are made regarding uptime or response times during emergencies.</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-800 dark:text-white mb-1">2. Location data</h3>
            <p>Beacon may collect and use your location data to deliver relevant alerts and notify nearby responders. You consent to the collection and processing of your location information during active alert events. You may disable location sharing at any time in Privacy Settings.</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-800 dark:text-white mb-1">3. Alert notifications</h3>
            <p>You consent to receiving push notifications, SMS, or email alerts for emergency events in your registered area. Notification delivery is dependent on your device settings and network availability.</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-800 dark:text-white mb-1">4. Data sharing with authorities</h3>
            <p>In the event of a declared emergency, your alert activity and general location may be shared with local emergency services, law enforcement, or authorized first responders. Beacon does not sell your personal data to third parties.</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-800 dark:text-white mb-1">5. No guarantee of service</h3>
            <p>Beacon does not guarantee platform availability at all times, particularly during large-scale emergencies. Do not rely solely on Beacon as your only emergency communication method.</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-800 dark:text-white mb-1">6. User conduct</h3>
            <p>You agree not to submit false, misleading, or malicious alerts. Misuse of the platform may result in account suspension and may be reported to appropriate authorities.</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-800 dark:text-white mb-1">7. Changes to terms</h3>
            <p>Beacon reserves the right to update these terms at any time. You will be notified of significant changes and may be asked to re-accept updated terms.</p>
          </div>
        </div>

        <p class="text-sm text-gray-500">
          You accepted these terms on <span class="font-medium">{new Date(data.user?.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>.
        </p>
      </div>
      {/if}
      
    </div>
  </div>
</div>