import { AlignLeft, AtSign, CalendarDays, ChevronDown, CircleDot, Hash, Link2, ListChecks, Paperclip, Smartphone, SquareCheck, Type, type LucideIcon } from 'lucide-react';
import type { FieldType } from '../../config/types';

export const FIELD_TYPE_ICONS: Record<FieldType, LucideIcon> = {
  text: Type,
  number: Hash,
  email: AtSign,
  mobile: Smartphone,
  date: CalendarDays,
  dropdown: ChevronDown,
  multiselect: ListChecks,
  radio: CircleDot,
  checkbox: SquareCheck,
  file: Paperclip,
  textarea: AlignLeft,
  url: Link2,
};
