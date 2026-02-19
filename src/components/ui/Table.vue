<template>
  <div class="vbwd-table-wrapper">
    <table :class="['vbwd-table', { 'vbwd-table-striped': striped, 'vbwd-table-hoverable': hoverable }]">
      <thead v-if="columns.length">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :class="[
              'vbwd-table-th',
              col.align ? `vbwd-table-align-${col.align}` : '',
              { 'vbwd-table-sortable': col.sortable }
            ]"
            :style="col.width ? { width: col.width } : {}"
            @click="col.sortable && handleSort(col.key)"
          >
            <span class="vbwd-table-th-content">
              {{ col.label }}
              <span v-if="col.sortable" class="vbwd-table-sort-icon">
                <svg v-if="sortKey === col.key" width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path v-if="sortOrder === 'asc'" d="M6 2L10 8H2L6 2Z" />
                  <path v-else d="M6 10L2 4H10L6 10Z" />
                </svg>
                <svg v-else width="12" height="12" viewBox="0 0 12 12" fill="currentColor" opacity="0.3">
                  <path d="M6 2L10 6H2L6 2ZM6 10L2 6H10L6 10Z" />
                </svg>
              </span>
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length" class="vbwd-table-loading">
            <slot name="loading">Loading...</slot>
          </td>
        </tr>
        <tr v-else-if="!data.length">
          <td :colspan="columns.length" class="vbwd-table-empty">
            <slot name="empty">No data available</slot>
          </td>
        </tr>
        <template v-else>
          <tr v-for="(row, index) in data" :key="rowKey ? row[rowKey] : index">
            <td
              v-for="col in columns"
              :key="col.key"
              :class="['vbwd-table-td', col.align ? `vbwd-table-align-${col.align}` : '']"
            >
              <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]" :index="index">
                {{ row[col.key] }}
              </slot>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { TableColumn } from './types';

const props = withDefaults(defineProps<{
  columns: TableColumn[];
  data: Record<string, unknown>[];
  rowKey?: string;
  striped?: boolean;
  hoverable?: boolean;
  loading?: boolean;
}>(), {
  columns: () => [],
  data: () => [],
  striped: false,
  hoverable: true,
  loading: false,
});

const emit = defineEmits<{
  sort: [key: string, order: 'asc' | 'desc'];
}>();

const sortKey = ref<string | null>(null);
const sortOrder = ref<'asc' | 'desc'>('asc');

const handleSort = (key: string) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
  emit('sort', key, sortOrder.value);
};
</script>

<style scoped>
.vbwd-table-wrapper {
  overflow-x: auto;
}

.vbwd-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.vbwd-table-th,
.vbwd-table-td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid var(--vbwd-color-border, #e5e7eb);
}

.vbwd-table-th {
  font-weight: 600;
  color: var(--vbwd-color-text, #374151);
  background: var(--vbwd-color-surface, #f9fafb);
}

.vbwd-table-td {
  color: var(--vbwd-color-text, #374151);
}

.vbwd-table-align-center {
  text-align: center;
}

.vbwd-table-align-right {
  text-align: right;
}

.vbwd-table-sortable {
  cursor: pointer;
  user-select: none;
}

.vbwd-table-sortable:hover {
  background: var(--vbwd-color-surface-hover, #f3f4f6);
}

.vbwd-table-th-content {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.vbwd-table-sort-icon {
  display: inline-flex;
}

.vbwd-table-striped tbody tr:nth-child(even) {
  background: var(--vbwd-color-surface, #f9fafb);
}

.vbwd-table-hoverable tbody tr:hover {
  background: var(--vbwd-color-surface-hover, #f3f4f6);
}

.vbwd-table-loading,
.vbwd-table-empty {
  text-align: center;
  padding: 2rem;
  color: var(--vbwd-color-text-muted, #9ca3af);
}
</style>
