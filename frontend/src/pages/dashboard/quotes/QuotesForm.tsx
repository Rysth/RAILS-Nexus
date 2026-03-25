import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import toast from "react-hot-toast";
import { useQuoteStore } from "../../../stores/quoteStore";
import { useProjectStore } from "../../../stores/projectStore";
import type { Quote, QuoteFormData } from "../../../types/quote";
import { QUOTE_STATUSES } from "../../../types/quote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface QuotesFormProps {
  quote?: Quote | null;
  defaultProjectId?: number;
  onClose: () => void;
}

export default function QuotesForm({
  quote,
  defaultProjectId,
  onClose,
}: QuotesFormProps) {
  const {
    isLoading: storeLoading,
    createQuote,
    updateQuote,
    fetchQuote,
  } = useQuoteStore();
  const { projects, fetchProjects } = useProjectStore();
  const [isLoading, setIsLoading] = useState(false);

  const isEditing = !!quote;

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<QuoteFormData>({
    defaultValues: {
      project_id: "",
      issue_date: "",
      valid_until: "",
      status: "draft",
      quote_items_attributes: [
        { description: "", quantity: 1, unit_price: "" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "quote_items_attributes",
  });

  const watchItems = watch("quote_items_attributes");

  useEffect(() => {
    if (projects.length === 0) {
      fetchProjects(1, 100);
    }
  }, [projects.length, fetchProjects]);

  useEffect(() => {
    const loadQuote = async () => {
      if (isEditing && quote) {
        // Fetch the full quote with items
        try {
          const fullQuote = await fetchQuote(quote.id);
          reset({
            project_id: fullQuote.project_id,
            issue_date: fullQuote.issue_date,
            valid_until: fullQuote.valid_until || "",
            status: fullQuote.status,
            quote_items_attributes:
              fullQuote.quote_items && fullQuote.quote_items.length > 0
                ? fullQuote.quote_items.map((item) => ({
                    id: item.id,
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.unit_price,
                  }))
                : [{ description: "", quantity: 1, unit_price: "" }],
          });
        } catch {
          toast.error("Error al cargar la cotización");
        }
      } else {
        reset({
          project_id: defaultProjectId || "",
          issue_date: new Date().toISOString().split("T")[0],
          valid_until: "",
          status: "draft",
          quote_items_attributes: [
            { description: "", quantity: 1, unit_price: "" },
          ],
        });
      }
    };
    loadQuote();
  }, [isEditing, quote, defaultProjectId, reset, fetchQuote]);

  const calculateSubtotal = (index: number): number => {
    const item = watchItems?.[index];
    if (!item) return 0;
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unit_price) || 0;
    return qty * price;
  };

  const calculateTotal = (): number => {
    if (!watchItems) return 0;
    return watchItems.reduce(
      (sum, _, index) => sum + calculateSubtotal(index),
      0,
    );
  };

  const onSubmit = async (data: QuoteFormData) => {
    const validItems = data.quote_items_attributes.filter(
      (item) => !item._destroy && item.description.trim() !== "",
    );

    if (validItems.length === 0) {
      toast.error("Debe agregar al menos un ítem a la cotización");
      return;
    }

    setIsLoading(true);
    try {
      const payload: QuoteFormData = {
        project_id: Number(data.project_id),
        issue_date: data.issue_date,
        valid_until: data.valid_until || "",
        status: data.status,
        quote_items_attributes: data.quote_items_attributes.map((item) => ({
          ...(item.id ? { id: item.id } : {}),
          description: item.description,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          ...(item._destroy ? { _destroy: true } : {}),
        })),
      };

      if (isEditing && quote) {
        await updateQuote(quote.id, payload);
        toast.success("Cotización actualizada correctamente");
      } else {
        await createQuote(payload);
        toast.success("Cotización creada correctamente");
      }
      onClose();
    } catch (error: any) {
      toast.error(
        error.message ||
          `Error al ${isEditing ? "actualizar" : "crear"} cotización`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Project */}
      <div className="space-y-2">
        <Label htmlFor="project_id">Proyecto</Label>
        <select
          id="project_id"
          disabled={!!defaultProjectId}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          {...register("project_id", {
            required: "Debes seleccionar un proyecto",
          })}
        >
          <option value="">Seleccionar proyecto...</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name} — {project.client_name}
            </option>
          ))}
        </select>
        {errors.project_id && (
          <p className="text-sm text-destructive">
            {errors.project_id.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Issue Date */}
        <div className="space-y-2">
          <Label htmlFor="issue_date">Fecha de Emisión</Label>
          <Input
            id="issue_date"
            type="date"
            {...register("issue_date", {
              required: "La fecha de emisión es requerida",
            })}
          />
          {errors.issue_date && (
            <p className="text-sm text-destructive">
              {errors.issue_date.message}
            </p>
          )}
        </div>

        {/* Valid Until */}
        <div className="space-y-2">
          <Label htmlFor="valid_until">Válida Hasta</Label>
          <Input id="valid_until" type="date" {...register("valid_until")} />
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <select
            id="status"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            {...register("status", { required: "El estado es requerido" })}
          >
            {QUOTE_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
          {errors.status && (
            <p className="text-sm text-destructive">{errors.status.message}</p>
          )}
        </div>
      </div>

      {/* Quote Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Ítems de la Cotización</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({ description: "", quantity: 1, unit_price: "" })
            }
          >
            <Plus className="w-4 h-4 mr-1" />
            Agregar Ítem
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Descripción</TableHead>
                <TableHead className="w-[15%]">Cantidad</TableHead>
                <TableHead className="w-[20%]">Precio Unit.</TableHead>
                <TableHead className="w-[15%] text-right">Subtotal</TableHead>
                <TableHead className="w-[10%]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field.id}>
                  <TableCell className="p-2">
                    <Input
                      placeholder="Descripción del ítem"
                      {...register(
                        `quote_items_attributes.${index}.description`,
                        { required: "Requerido" },
                      )}
                    />
                    {errors.quote_items_attributes?.[index]?.description && (
                      <p className="text-xs text-destructive mt-1">
                        {
                          errors.quote_items_attributes[index].description
                            ?.message
                        }
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="number"
                      min="1"
                      placeholder="1"
                      {...register(`quote_items_attributes.${index}.quantity`, {
                        required: "Requerido",
                        min: { value: 1, message: "Mín. 1" },
                      })}
                    />
                  </TableCell>
                  <TableCell className="p-2">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...register(
                        `quote_items_attributes.${index}.unit_price`,
                        {
                          required: "Requerido",
                          min: { value: 0.01, message: "Mín. $0.01" },
                        },
                      )}
                    />
                  </TableCell>
                  <TableCell className="p-2 text-right tabular-nums font-medium">
                    ${calculateSubtotal(index).toFixed(2)}
                  </TableCell>
                  <TableCell className="p-2">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {/* Total Row */}
              <TableRow className="bg-muted/50">
                <TableCell colSpan={3} className="p-2 text-right font-semibold">
                  Total:
                </TableCell>
                <TableCell className="p-2 text-right tabular-nums font-bold text-lg">
                  ${calculateTotal().toFixed(2)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || storeLoading}>
          {(isLoading || storeLoading) && (
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          )}
          {isEditing ? "Guardar Cambios" : "Crear Cotización"}
        </Button>
      </div>
    </form>
  );
}
