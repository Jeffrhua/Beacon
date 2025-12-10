<script>
    import { signUp } from "$lib/auth-client";
	import { goto } from "$app/navigation";
    import { writable } from "svelte/store";

	const signupFirstName = writable("");
	const signupLastName = writable("");
	const signupEmail = writable("");
	const signupPassword = writable("");
    const handleSignUp = async () => {
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

<h1>Sign Up</h1>
<div>
	<label>
		First Name
		<input id="fname" name="fname" bind:value={$signupFirstName} required>
	</label>
	<label>
		Last Name
		<input id="lname" name="lname" bind:value={$signupLastName} required>
	</label>
	<label>
		Email
		<input id="email" name="email" bind:value={$signupEmail} required/>
	</label>
	<label>
		Password
		<input id = "password" name="password" bind:value={$signupPassword} required>
	</label>

	<button type="submit" on:click={handleSignUp}>Sign Up</button>
</div>

<style>
</style>