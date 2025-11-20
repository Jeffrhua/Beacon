<script lang="ts">
    import { enhance } from '$app/forms';
	import { Datatable, Search, RowsPerPage, RowCount, Pagination, TableHandler, ThSort, ThFilter } from '@vincjo/datatables';
	type User = {firstname: string; lastname: string; email: string};
	let {data} = $props();
	let table : TableHandler = $state(new TableHandler(data.users, {rowsPerPage: 10}));
</script>

<form method="POST">
	<label>
		First Name
		<input id="firstname" name="firstname" required/>
	</label>
	<label>
		Last Name
		<input id="lastname" name="lastname" required/>
	</label>
	<label>
		Email
		<input id="email" name="email" required/>
	
	</label>

	<button type="submit">Create user</button>
</form>


{#if table}
<Datatable {table}>
	<table>
		<thead>
			<tr>
				<ThSort {table} field="firstname">First Name</ThSort>
				<ThSort {table} field="lastname">Last Name</ThSort>
				<ThSort {table} field="email">Email</ThSort>
			</tr>
			<tr>
				<ThFilter {table} field="firstname"></ThFilter>
				<ThFilter {table} field="lastname"></ThFilter>
				<ThFilter {table} field="email"></ThFilter>
			</tr>
		</thead>
		<tbody>
			{#each table.rows as row}
				<tr>
					<td>{row.firstname}</td>
					<td>{row.lastname}</td>
					<td>{row.email}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</Datatable>
{/if}

<style>
</style>
