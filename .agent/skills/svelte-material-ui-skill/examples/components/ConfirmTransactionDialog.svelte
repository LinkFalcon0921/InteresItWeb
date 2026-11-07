<script lang="ts">
  import Dialog, {
    Title,
    Content,
    Actions,
} from '@smui/dialog';
  import Button, { Label } from '@smui/button';

  let {
    open = $bindable(false),
    onConfirm,
    onCancel,
  }: {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  } = $props();

  function cancel(): void {
    open = false;
    onCancel();
  }

  function confirm(): void {
    onConfirm();
    open = false;
  }
</script>

<Dialog
  bind:open
  aria-labelledby="transaction-confirm-title"
  aria-describedby="transaction-confirm-description"
>
  <Title id="transaction-confirm-title">Confirmar movimiento</Title>
  <Content id="transaction-confirm-description">
    ¿Deseas continuar con esta operación?
  </Content>
  <Actions>
    <Button onclick={cancel}>
      <Label>Cancelar</Label>
    </Button>
    <Button variant="raised" onclick={confirm}>
      <Label>Confirmar</Label>
    </Button>
  </Actions>
</Dialog>
