// Shared types for UI components

export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

export interface DropdownItem {
  label: string;
  value: unknown;
  disabled?: boolean;
}
