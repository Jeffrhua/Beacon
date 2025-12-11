<script>
  import { Input, Label, Button } from "flowbite-svelte";


    const saveSetting = async () => {
        console.log("YIPEEEEE")
    }
</script>

<form method="POST">
  <div class="mb-6 grid gap-6 md:grid-cols-2">
    <div>
      <Label for="value" class="mb-2">Value</Label>
      <Input type="text" name="setting_value" required />
    </div>
  <Button type="submit">Submit</Button>
  </div>
</form>