import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Settings, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOptions, useCreateOption } from '@/hooks/useOptions';

const categories = ['Produto', 'Recheio', 'Entrega', 'Status Pagamento'] as const;

const formSchema = z.object({
  category: z.enum(categories, { required_error: 'Selecione uma categoria' }),
  value: z.string().min(2, 'Valor deve ter pelo menos 2 caracteres'),
});

type FormData = z.infer<typeof formSchema>;

const ManageOptions = () => {
  const { data: options = [], isLoading } = useOptions();
  const createOptionMutation = useCreateOption();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: '',
    },
  });

  const onSubmit = (data: FormData) => {
    // Type assertion to ensure data has all required fields
    const submitData = data as Required<FormData>;
    createOptionMutation.mutate(submitData, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  // Agrupar por categoria
  const groupedOptions = categories.reduce((acc, category) => {
    acc[category] = options.filter(option => option.category === category);
    return acc;
  }, {} as Record<string, typeof options>);

  return (
    <div className="min-h-screen bg-gradient-sweet">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
                <Settings className="h-8 w-8" />
                Gerenciar Opções
              </h1>
              <p className="text-muted-foreground text-lg">
                Adicione e gerencie as opções do sistema
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Formulário para Adicionar */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Adicionar Nova Opção
                </CardTitle>
                <CardDescription>
                  Preencha os dados para criar uma nova opção
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    {/* Categoria */}
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">Categoria</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background border-border">
                                <SelectValue placeholder="Selecione a categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Valor */}
                    <FormField
                      control={form.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">Valor</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Digite o valor da opção"
                              className="bg-background border-border"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Botão */}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createOptionMutation.isPending}
                    >
                      {createOptionMutation.isPending ? 'Adicionando...' : 'Adicionar Opção'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Lista de Opções Existentes */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-2xl text-foreground">Opções Existentes</CardTitle>
                <CardDescription>
                  Visualize todas as opções por categoria
                </CardDescription>
              </CardHeader>

              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Carregando opções...
                  </div>
                ) : (
                  <div className="space-y-6">
                    {categories.map((category) => (
                      <div key={category} className="space-y-3">
                        <h3 className="font-semibold text-foreground border-b pb-2">
                          {category}
                        </h3>
                        <div className="space-y-2">
                          {groupedOptions[category]?.length > 0 ? (
                            groupedOptions[category].map((option) => (
                              <div
                                key={option.id}
                                className="p-3 bg-muted/30 rounded-lg text-sm"
                              >
                                {option.value}
                              </div>
                            ))
                          ) : (
                            <p className="text-muted-foreground text-sm italic">
                              Nenhuma opção encontrada
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageOptions;
