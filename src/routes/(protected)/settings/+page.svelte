<script lang="ts">
  import { Sidebar, SidebarGroup, SidebarItem, Input, Label, Button } from "flowbite-svelte";
  import { KeyboardSolid, LockSolid, UserSolid, InfoCircleSolid, CloseCircleSolid, CogSolid, EyeSolid } from "flowbite-svelte-icons";
  
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
  <div class="h-96 overflow-auto px-4 md:ml-64">
    <div class="rounded-lg border-2 border-dashed border-gray-200 p-4 dark:border-gray-700">
      {#if currentSection === "profile"}
      <form method="POST">
        <div class="mb-6 grid gap-6 md:grid-rows-2">
          <div>
            <Label for="value" class="mb-2">Value</Label>
            <Input type="text" name="setting_value" required />
          </div>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
      {/if}
    </div>
  </div>
</div>