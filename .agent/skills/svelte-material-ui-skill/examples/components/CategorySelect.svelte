<script lang="ts">
  import Select, { Option } from '@smui/select';
  import {
    TransactionCategory,
    getTransactionCategoryLabel,
  } from '../domain/TransactionCategory';

  let {
    value = $bindable(TransactionCategory.OTHER),
  }: {
    value: TransactionCategory;
  } = $props();

  const categories = Object.values(TransactionCategory);
</script>

<Select bind:value label="Categoría">
  {#each categories as category (category)}
    <Option value={category}>
      {getTransactionCategoryLabel(category)}
    </Option>
  {/each}
</Select>
