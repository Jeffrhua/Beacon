<script>
	import { signIn} from "$lib/auth-client";
    import { writable } from "svelte/store";


	const signinEmail = writable("");
	const signinPassword = writable("");
    const handleSignIn = async () => {
	await signIn.email(
		{
			email: $signinEmail,
			password: $signinPassword,
			callbackURL: "/",
		},
		{
			onError(context) {
				alert(context.error.message);
			},
		},
	);

};    
</script>

<h1>Sign in</h1>
<div>
	<label>
		Email
		<input id="email" name="email" bind:value={$signinEmail} required/>
	</label>
	<label>
		Password
		<input id = "password" name="password" bind:value={$signinPassword} required>
	</label>

	<button type="submit" on:click={handleSignIn}>Sign in</button>
</div>
<div>
	Don&apos;t have an account?
	<a href="/sign-up" class="underline">Sign up</a>
</div>
<style></style>