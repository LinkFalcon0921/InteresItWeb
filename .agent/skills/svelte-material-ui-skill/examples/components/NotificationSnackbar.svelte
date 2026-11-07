<script lang="ts">
  import Snackbar, { Label } from '@smui/snackbar';
  import Button from '@smui/button';

  let snackbar: Snackbar;

  function showNotification(): void {
    snackbar.open();
  }
</script>

<Snackbar bind:this={snackbar}>
  <Label>Movimiento guardado correctamente.</Label>
</Snackbar>

<Button onclick={showNotification}>
  Mostrar notificación
</Button>
