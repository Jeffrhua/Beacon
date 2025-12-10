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

    const handleSignUp = async () => {
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
		<Checkbox classes={{ div: "mb-6 gap-1 rtl:space-x-reverse" }} required>
			I agree with the <A href="/" class="text-primary-700 dark:text-primary-600 hover:underline">terms and conditions</A>.
		</Checkbox>
		<Button type="submit" onclick={handleSignUp}>Sign up</Button>
		<div class="mt-3">
			Already have an account?
			<a href="/sign-in" class="underline text-blue-600">Sign in</a>
		</div>
		</form>
	</Card>
</div>




<style>
</style>