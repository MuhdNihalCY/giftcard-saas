/**
 * Shared UI component re-exports
 *
 * Import shared UI primitives from '@/shared/ui' so that feature components
 * always go through this single barrel rather than depending directly on
 * '@/components/ui/*'.
 */

export { Badge, getStatusBadgeVariant } from '@/components/ui/Badge';
export type { BadgeVariant, BadgeSize } from '@/components/ui/Badge';

export { Button } from '@/components/ui/Button';

export { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export { DataTable } from '@/components/ui/DataTable';
export type { Column, DataTableProps } from '@/components/ui/DataTable';

export { Input } from '@/components/ui/Input';

export { Label } from '@/components/ui/Label';

export { Select } from '@/components/ui/Select';

export { Skeleton } from '@/components/ui/Skeleton';

export { Switch } from '@/components/ui/Switch';

export { Textarea } from '@/components/ui/Textarea';

export { ThemeToggle } from '@/components/ui/ThemeToggle';

export { useToast } from '@/components/ui/ToastContainer';
