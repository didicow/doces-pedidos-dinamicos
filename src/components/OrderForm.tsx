import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ShoppingBag, MapPin, CreditCard } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

// Hook atualizado
import { useOptionsByCategory } from '@/hooks/useOptions';

const formSchema = z.object({
  nomeCliente: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  produto: z.string({ required_error: 'Selecione um produto' }),
  quantidade: z.coerce.number().min(1, 'Quantidade deve ser pelo menos 1'),
  valorPedido: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
  sabores: z.array(z.string()).min(1, 'Selecione pelo menos um sabor'),
  observacao: z.string().optional(),
  forma: z.string({ required_error: 'Selecione a forma de entrega' }),
  endereco: z.string().optional(),
  statusPagamento: z.string({ required_error: 'Selecione o status do pagamento' }),
  dataEntrega: z.date({ required_error: 'Selecione a data de entrega' }),
  horaEntrega: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)')
});

type FormData = z.infer<typeof formSchema>;

export function OrderForm() {
  const [selectedSabores, setSelectedSabores] = useState<string[]>([]);
  const { toast } = useToast();

  // Puxa dados filtrados por categoria
  const { options: produtos, isLoading: loadingProdutos } = useOptionsByCategory('Produto');
  const { options: recheios, isLoading: loadingRecheios } = useOptionsByCategory('Recheio');
  const { options: entregas, isLoading: loadingEntregas } = useOptionsByCategory('Entrega');
  const { options: statusPagamentos, isLoading: loadingStatus } = useOptionsByCategory('Status Pagamento');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nomeCliente: '',
      quantidade: 1,
      valorPedido: 0,
      sabores: [],
      observacao: '',
      endereco: '',
      horaEntrega: '14:00'
    },
  });

  const onSaborChange = (sabor: string, checked: boolean) => {
    const currentSabores = form.getValues('sabores');
    const newSabores = checked
      ? [...currentSabores, sabor]
      : currentSabores.filter((s) => s !== sabor);

    setSelectedSabores(newSabores);
    form.setValue('sabores', newSabores);
  };

  const onSubmit = (data: FormData) => {
    console.log('Pedido enviado:', data);
    toast({
      title: "Pedido Enviado! 🍰",
      description: `Pedido de ${data.nomeCliente} foi registrado com sucesso!`,
    });

    form.reset();
    setSelectedSabores([]);
  };

  return (
    <div className="min-h-screen bg-gradient-sweet">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Thai Doces 🍰</h1>
            <p className="text-muted-foreground text-lg">
              Faça seu pedido de doces artesanais
            </p>
          </div>

          <Card className="shadow-soft">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-foreground">Novo Pedido</CardTitle>
              <CardDescription>Preencha os dados do seu pedido com carinho</CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                  {/* Produto */}
                  <FormField
                    control={form.control}
                    name="produto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4" /> Produto
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background border-border">
                              <SelectValue placeholder="Selecione o produto" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loadingProdutos ? (
                              <SelectItem value="">Carregando...</SelectItem>
                            ) : (
                              produtos.map((p) => (
                                <SelectItem key={p.id} value={p.valor}>
                                  {p.valor}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Recheios */}
                  <FormField
                    control={form.control}
                    name="sabores"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Recheio</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-muted/30 rounded-lg">
                          {loadingRecheios ? (
                            <p>Carregando recheios...</p>
                          ) : (
                            recheios.map((sabor) => (
                              <div key={sabor.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={sabor.valor}
                                  checked={selectedSabores.includes(sabor.valor)}
                                  onCheckedChange={(checked) =>
                                    onSaborChange(sabor.valor, checked as boolean)
                                  }
                                />
                                <label
                                  htmlFor={sabor.valor}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {sabor.valor}
                                </label>
                              </div>
                            ))
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Forma de Entrega */}
                  <FormField
                    control={form.control}
                    name="forma"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4" /> Forma de Entrega
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background border-border">
                              <SelectValue placeholder="Como deseja receber?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loadingEntregas ? (
                              <SelectItem value="">Carregando...</SelectItem>
                            ) : (
                              entregas.map((e) => (
                                <SelectItem key={e.id} value={e.valor}>
                                  {e.valor}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Status Pagamento */}
                  <FormField
                    control={form.control}
                    name="statusPagamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium flex items-center gap-2">
                          <CreditCard className="h-4 w-4" /> Status do Pagamento
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background border-border">
                              <SelectValue placeholder="Status do pagamento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {loadingStatus ? (
                              <SelectItem value="">Carregando...</SelectItem>
                            ) : (
                              statusPagamentos.map((s) => (
                                <SelectItem key={s.id} value={s.valor}>
                                  {s.valor}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Botão */}
                  <Button type="submit" variant="sweet" size="lg" className="w-full text-lg py-6 mt-8">
                    Enviar Pedido 🍰
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
