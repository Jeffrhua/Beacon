<script lang="ts">
  import { Sidebar, SidebarGroup, SidebarItem, Input, Label, Button, Textarea, PhoneInput } from "flowbite-svelte";
  import { KeyboardSolid, LockSolid, UserSolid, InfoCircleSolid, CloseCircleSolid, CogSolid, EyeSolid } from "flowbite-svelte-icons";
  
  const { data } = $props();
  // Grab user from server, if somehow null just use blank defaults
  const user = data.user ?? { displayName: "", name: "", profileDescription: "", phoneNumber: "" };

  let currentSection = $state<"profile" | "accessibility" | "security" | "terms" | "appearance"> ("profile");
</script>

<div class="w-full flex items-center justify-between px-4 py-3 border-b bg-gray-50">
  <a
    href="/"
    class="inline-flex items-center justify-center p-2 rounded-md 
           hover:bg-gray-200 dark:hover:bg-gray-700"
  >
    <CloseCircleSolid class="h-6 w-6" />
  </a>

  <div class="flex-1 flex justify-center gap-2 items-center pointer-events-none">
    <CogSolid class="shrink-0 h-6 w-6" />
    <h1 class="text-lg font-semibold">
      Settings
    </h1>
  </div>
</div>

<div class="relative">
  <Sidebar
    backdrop={false}
    params={{ x: -50, duration: 50 }}
    class="z-50 h-full"
    position="absolute"
    classes={{ nonactive: "p-2", active: "p-2" }}
  >
    <!-- Side Bar Setting Buttons-->
    <SidebarGroup>
      <SidebarItem label="Profile" onclick={() => currentSection = "profile"} class="cursor-pointer">
        {#snippet icon()}
          <UserSolid class="shrink-0 h-6 w-6" />
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
            <Input type="text" name="display_name" value = {user.displayName ?? user.name} required />
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