<script lang="ts">
  import Textfield from '@smui/textfield';
  import HelperText from '@smui/textfield/helper-text';

  let {
    value = $bindable(''),
  }: {
    value: string;
  } = $props();
</script>

<Textfield bind:value label="Descripción" required>
  {#snippet helper()}
    <HelperText>Describe brevemente el movimiento.</HelperText>
  {/snippet}
</Textfield>
