<template>
  <nav class="vbwd-pagination" role="navigation" aria-label="Pagination">
    <button
      class="vbwd-pagination-btn vbwd-pagination-prev"
      :disabled="currentPage <= 1"
      @click="goToPage(currentPage - 1)"
      aria-label="Previous page"
    >
      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
    </button>

    <template v-for="page in visiblePages" :key="page">
      <span v-if="page === '...'" class="vbwd-pagination-ellipsis">...</span>
      <button
        v-else
        :class="['vbwd-pagination-btn', 'vbwd-pagination-page', { 'vbwd-pagination-active': page === currentPage }]"
        :aria-current="page === currentPage ? 'page' : undefined"
        @click="goToPage(page as number)"
      >
        {{ page }}
      </button>
    </template>

    <button
      class="vbwd-pagination-btn vbwd-pagination-next"
      :disabled="currentPage >= totalPages"
      @click="goToPage(currentPage + 1)"
      aria-label="Next page"
    >
      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  currentPage: number;
  totalPages: number;
  siblingCount?: number;
}>(), {
  siblingCount: 1,
});

const emit = defineEmits<{
  'update:currentPage': [page: number];
}>();

const visiblePages = computed(() => {
  const pages: (number | string)[] = [];
  const { currentPage, totalPages, siblingCount } = props;

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  pages.push(1);

  const leftSibling = Math.max(currentPage - siblingCount, 2);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages - 1);

  if (leftSibling > 2) {
    pages.push('...');
  }

  for (let i = leftSibling; i <= rightSibling; i++) {
    pages.push(i);
  }

  if (rightSibling < totalPages - 1) {
    pages.push('...');
  }

  pages.push(totalPages);

  return pages;
});

const goToPage = (page: number) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('update:currentPage', page);
  }
};
</script>

<style scoped>
.vbwd-pagination {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.vbwd-pagination-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 2rem;
  padding: 0 0.5rem;
  border: 1px solid var(--vbwd-color-border, #e5e7eb);
  border-radius: var(--vbwd-pagination-radius, 0.375rem);
  background: white;
  color: var(--vbwd-color-text, #374151);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.vbwd-pagination-btn:hover:not(:disabled) {
  background: var(--vbwd-color-surface, #f9fafb);
  border-color: var(--vbwd-color-primary, #3b82f6);
}

.vbwd-pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.vbwd-pagination-active {
  background: var(--vbwd-color-primary, #3b82f6);
  border-color: var(--vbwd-color-primary, #3b82f6);
  color: white;
}

.vbwd-pagination-active:hover:not(:disabled) {
  background: var(--vbwd-color-primary-dark, #2563eb);
  border-color: var(--vbwd-color-primary-dark, #2563eb);
}

.vbwd-pagination-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  color: var(--vbwd-color-text-muted, #9ca3af);
}

.vbwd-pagination-prev,
.vbwd-pagination-next {
  padding: 0;
}
</style>
