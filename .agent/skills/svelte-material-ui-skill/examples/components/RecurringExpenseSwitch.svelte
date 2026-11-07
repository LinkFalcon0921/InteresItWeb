<script lang="ts">
  import Switch from '@smui/switch';
  import FormField from '@smui/form-field';

  let {
    enabled = $bindable(false),
  }: {
    enabled: boolean;
  } = $props();
</script>

<FormField>
  <Switch bind:checked={enabled} />
  {#snippet label()}
    Movimiento recurrente
  {/snippet}
</FormField>
