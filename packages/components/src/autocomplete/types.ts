export interface Option {
  id: number;
  value: string;
}

export interface AutoCompleteProps {
  options: Option[];
  value?: string;
  defaultValue?: string;
  onSearch?: (value: string) => void;
  /** Bir seçenek seçildiğinde çağrılır. Eskiden bu bildirim HİÇ yoktu —
   * ebeveyn component'in ne seçildiğini bilmesinin bir yolu yoktu. */
  onSelect?: (value: string) => void;
  placeholder?: string;
  /** @deprecated `closeOnBlur` kullanın — aynı şey, daha açık bir isim. */
  onBlur?: boolean;
  closeOnBlur?: boolean;
}
