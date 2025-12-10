<script>
	import { signIn} from "$lib/auth-client";
    import { writable } from "svelte/store";
  	import { Card, Button, Input, Label, Checkbox, A, P } from "flowbite-svelte";

	const signinEmail = writable("");
	const signinPassword = writable("");
    const handleSignIn = async () => {
	await signIn.email(
		{
			email: $signinEmail,
			password: $signinPassword,
			callbackURL: "/dashboard",
		},
		{
			onError(context) {
				alert(context.error.message);
			},
		},
	);

};    
</script>
<div class="min-h-screen flex justify-center items-center">
	<Card size="md" class="p-4 sm:p-6 md:p-8">
		<P size="2xl" class="mb-2 ">Sign In</P>
		<form>
			<div class="mb-6">
				<Label for="email" class="mb-2">Email address</Label>
				<Input bind:value={$signinEmail} type="email" id="email" required />
			</div>
			<div class="mb-6">
				<Label for="password" class="mb-2">Password</Label>
				<Input bind:value={$signinPassword} type="password" id="password" required />
			</div>
			<Button type="submit" onclick={handleSignIn}>Sign In</Button>
			<div class="mt-3">
				Don&apos;t have an account?
				<a href="/sign-up" class="underline text-blue-600">Sign up</a>
			</div>
		</form>
	</Card>
</div>


<style></style>