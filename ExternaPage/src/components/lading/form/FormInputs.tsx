import { Input, Label, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components";

interface BasicInputFieldProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder: string;
  required?: boolean;
  maxLength?: number;
}

export const BasicInputField = ({
  id,
  name,
  label,
  type = "text",
  placeholder,
  required = false,
  maxLength,
}: BasicInputFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label} {required && '*'}</Label>
      <Input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
      />
    </div>
  );
};

interface DisabledInputFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  description?: string;
}

export const DisabledInputField = ({
  id,
  name,
  label,
  value,
  description,
}: DisabledInputFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        value={value}
        disabled
        className="bg-gray-50 cursor-not-allowed text-gray-700 font-medium"
      />
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
};

interface TextAreaFieldProps {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  rows?: number;
  required?: boolean;
  maxLength?: number;
  description?: string;
}

export const TextAreaField = ({
  id,
  name,
  label,
  placeholder,
  rows = 6,
  required = false,
  maxLength,
  description,
}: TextAreaFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label} {required && '*'}</Label>
      <Textarea
        id={id}
        name={name}
        placeholder={placeholder}
        rows={rows}
        required={required}
        maxLength={maxLength}
      />
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
};

interface Category {
  id: number;
  nombre_categoria: string;
}

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  isLoading: boolean;
}

export const CategorySelector = ({
  categories,
  selectedCategory,
  onCategoryChange,
  isLoading,
}: CategorySelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="testimonial-category">Categoría *</Label>
      <Select
        value={selectedCategory}
        onValueChange={onCategoryChange}
        disabled={isLoading}
      >
        <SelectTrigger id="testimonial-category">
          <SelectValue placeholder="Selecciona una categoría" />
        </SelectTrigger>
        <SelectContent>
          {isLoading ? (
            <SelectItem value="loading" disabled>
              Cargando categorías...
            </SelectItem>
          ) : categories.length === 0 ? (
            <SelectItem value="empty" disabled>
              No hay categorías disponibles
            </SelectItem>
          ) : (
            categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.nombre_categoria}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      <p className="text-sm text-gray-500">
        Selecciona la categoría que mejor describa tu experiencia
      </p>
    </div>
  );
};
