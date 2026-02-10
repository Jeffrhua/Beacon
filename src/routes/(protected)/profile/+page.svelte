<script lang="ts">
	import { page } from '$app/stores';
	import { Card, Button, Input, Label, P } from 'flowbite-svelte';
	export let data;

	const initialProfile = data.profile;

    $: form = $page.form;
    $: values = form?.values ?? initialProfile;
    $: errors = form?.errors ?? {};
    $: success = form?.success ?? false;
</script>

<div class="min-h-screen flex justify-center items-center">
    <Card size="lg" class="p-6 sm:p-8 md:p-10 w-full max-w-xl">
        <P size="2xl" class="mb-6">Edit Profile</P>

        {#if success}
            <p class="text-green-600 mb-4">Profile updated.</p>
        {/if}

        <form method="POST" class="space-y-6">
            <!-- First Name -->
            <div>
                <Label for="firstName" class="mb-2">First name</Label>
                <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    bind:value={values.firstName}
                    required
                />
                {#if errors.firstName}
                    <p class="text-red-600 text-sm">{errors.firstName}</p>
                {/if}
            </div>

            <!-- Last Name i think -->
            <div>
                <Label for="lastName" class="mb-2">Last name</Label>
                <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    bind:value={values.lastName}
                    required
                />
                {#if errors.lastName}
                    <p class="text-red-600 text-sm">{errors.lastName}</p>
                {/if}
            </div>

            <!-- Phone -->
            <div>
                <Label for="phone" class="mb-2">Phone number</Label>
                <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    bind:value={values.phone}
                    required
                />
                {#if errors.phone}
                    <p class="text-red-600 text-sm">{errors.phone}</p>
                {/if}
            </div>

            <Button type="submit" class="w-full">
                Save
            </Button>
        </form>
    </Card>
</div>

<style></style>