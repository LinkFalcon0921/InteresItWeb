<script lang="ts">
  import DataTable, {
    Head,
    Body,
    Row,
    Cell,
  } from '@smui/data-table';
  import {
    TransactionCategory,
    getTransactionCategoryLabel,
  } from '../domain/TransactionCategory';

  type TransactionRow = {
    id: string;
    description: string;
    category: TransactionCategory;
    amountLabel: string;
  };

  let {
    transactions,
  }: {
    transactions: TransactionRow[];
  } = $props();
</script>

<DataTable
  table$aria-label="Historial de movimientos"
  style="max-width: 100%;"
>
  <Head>
    <Row>
      <Cell>Descripción</Cell>
      <Cell>Categoría</Cell>
      <Cell numeric>Monto</Cell>
    </Row>
  </Head>
  <Body>
    {#each transactions as transaction (transaction.id)}
      <Row>
        <Cell>{transaction.description}</Cell>
        <Cell>
          {getTransactionCategoryLabel(transaction.category)}
        </Cell>
        <Cell numeric>{transaction.amountLabel}</Cell>
      </Row>
    {/each}
  </Body>
</DataTable>
