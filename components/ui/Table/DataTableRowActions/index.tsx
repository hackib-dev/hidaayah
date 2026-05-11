'use client';

import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { Row, Column } from '@tanstack/react-table';

import { Button } from '../../button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../../dropdown-menu';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  column: Column<TData>;
  children?: React.ReactNode;
}

export function DataTableRowActions<TData>({
  // row and column are part of the required interface but not used in default render
  children
}: DataTableRowActionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
          <DotsVerticalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
