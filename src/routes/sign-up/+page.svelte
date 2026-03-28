<script>
    import { signUp } from "$lib/auth-client";
	import { goto } from "$app/navigation";
    import { writable } from "svelte/store";
	import { Card, Button, Input, Label, Checkbox, A, P } from "flowbite-svelte";


	const signupFirstName = writable("");
	const signupLastName = writable("");
	const signupEmail = writable("");
	const signupPassword = writable("");
	const signupConfirmPassword = writable("");
	const tosAccepted = writable(false);
	let tosModalOpen = $state(false);

    const handleSignUp = async () => {
	if (!$tosAccepted) {
		alert("Error: You must accept the terms and conditions.");
		return;
	}
	if($signupPassword !== $signupConfirmPassword){
			alert("Error: Passwords do not match.");
			return;
	}
	const user = {
		firstName: $signupFirstName,
		lastName: $signupLastName,
		email: $signupEmail,
		password: $signupPassword,
	};

	await signUp.email({
		email: user.email,
		password: user.password,
		name: `${user.firstName} ${user.lastName}`,
		callbackURL: "/",
		fetchOptions: {
			onSuccess() {
				alert("Your account has been created.");
				goto("/dashboard");
			},
			onError(context) {
				alert(context.error.message);
			},
		},
	});
};
</script>

<div class="min-h-screen flex justify-center items-center">
	<Card size="md" class="p-4 sm:p-6 md:p-8">
		<P size="2xl" class="mb-2 ">Sign Up</P>
		<form>
		<div class="mb-6 grid gap-6 md:grid-cols-2">
			<div>
			<Label for="first_name" class="mb-2">First name</Label>
			<Input type="text" id="first_name" bind:value={$signupFirstName} required />
			</div>
			<div>
			<Label for="last_name" class="mb-2">Last name</Label>
			<Input type="text" id="last_name" bind:value={$signupLastName} required />
			</div>
		</div>
		<div class="mb-6">
			<Label for="email" class="mb-2">Email address</Label>
			<Input type="email" id="email" bind:value={$signupEmail} required />
		</div>
		<div class="mb-6">
			<Label for="password" class="mb-2">Password</Label>
			<Input type="password" id="password" bind:value={$signupPassword} required />
		</div>
		<div class="mb-6">
			<Label for="confirm_password" class="mb-2">Confirm password</Label>
			<Input type="password" id="confirm_password" bind:value={$signupConfirmPassword} required />
		</div>
		<Checkbox bind:checked={$tosAccepted} classes={{ div: "mb-6 gap-1 rtl:space-x-reverse" }}>
			I agree with the <a href="/" onclick={(e) => { e.preventDefault(); tosModalOpen = true; }} class="text-primary-700 dark:text-primary-600 hover:underline">terms and conditions</a>.
		</Checkbox>
		<Button type="submit" onclick={handleSignUp}>Sign up</Button>
		<div class="mt-3">
			Already have an account?
			<a href="/sign-in" class="underline text-blue-600">Sign in</a>
		</div>
		</form>
	</Card>
</div>

{#if tosModalOpen}
<div style="background-color: rgba(0,0,0,0.85)!important;" class="fixed inset-0 z-50 flex items-center justify-center">
<div style="background-color: #1f2937; border: 1px solid #374151;" class="rounded-lg shadow-xl w-full max-w-lg mx-4 p-6">
	<h2 class="text-xl font-semibold mb-2">Terms and Conditions</h2>
	<p class="text-sm text-gray-500 mb-4">Last updated: March 2026</p>
	
	<div class="overflow-y-auto max-h-72 space-y-4 text-sm text-gray-600 dark:text-gray-400 pr-2">
	<div>
		<h3 class="font-semibold text-gray-800 dark:text-white mb-1">1. Service description</h3>
		<p>Beacon is a community emergency alert platform that enables users to send, receive, and respond to emergency alerts in real time. The platform is provided as-is with no guarantees regarding uptime during emergencies.</p>
	</div>
	<div>
		<h3 class="font-semibold text-gray-800 dark:text-white mb-1">2. Location data</h3>
		<p>Beacon may collect and use your location data to deliver relevant alerts and notify nearby responders. You may disable location sharing at any time in Privacy Settings.</p>
	</div>
	<div>
		<h3 class="font-semibold text-gray-800 dark:text-white mb-1">3. Alert notifications</h3>
		<p>You consent to receiving push notifications, SMS, or email alerts for emergency events in your registered area.</p>
	</div>
	<div>
		<h3 class="font-semibold text-gray-800 dark:text-white mb-1">4. Data sharing with authorities</h3>
		<p>During declared emergencies, your alert activity and general location may be shared with local emergency services or authorized first responders. Beacon does not sell your personal data.</p>
	</div>
	<div>
		<h3 class="font-semibold text-gray-800 dark:text-white mb-1">5. No guarantee of service</h3>
		<p>Do not rely solely on Beacon as your only emergency communication method.</p>
	</div>
	<div>
		<h3 class="font-semibold text-gray-800 dark:text-white mb-1">6. User conduct</h3>
		<p>You agree not to submit false or malicious alerts. Misuse may result in account suspension.</p>
	</div>
	</div>

	<div class="mt-6 flex justify-end gap-3">
	<Button color="alternative" onclick={() => tosModalOpen = false}>Close</Button>
	<Button onclick={() => { tosAccepted.set(true); tosModalOpen = false; }}>Accept & Close</Button>
	</div>
</div>
</div>
{/if}




<style>
</style>