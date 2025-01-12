import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  month: z.string().regex(/^(0[1-9]|1[0-2])$/, "Le mois doit être au format MM (01-12)"),
  year: z.string().regex(/^[0-9]{2}$/, "L'année doit être au format AA (00-99)")
});

interface PeriodFormProps {
  onSubmit: (period: string) => void;
}

const PeriodForm = ({ onSubmit }: PeriodFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      month: "",
      year: ""
    }
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    const formattedPeriod = `20${values.year}_${values.month}`;
    console.log("Période sélectionnée:", formattedPeriod);
    onSubmit(formattedPeriod);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="month"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mois (MM)</FormLabel>
                <FormControl>
                  <Input placeholder="MM" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Année (AA)</FormLabel>
                <FormControl>
                  <Input placeholder="AA" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full">
          Extraire toutes les informations
        </Button>
      </form>
    </Form>
  );
};

export default PeriodForm;