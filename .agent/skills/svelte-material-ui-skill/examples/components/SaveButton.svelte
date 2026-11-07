<script lang="ts">
  import Button, { Label } from '@smui/button';

  let {
    disabled = false,
    onSave,
  }: {
    disabled?: boolean;
    onSave: () => void;
  } = $props();
</script>

<Button variant="raised" {disabled} onclick={onSave}>
  <Label>Guardar</Label>
</Button>
