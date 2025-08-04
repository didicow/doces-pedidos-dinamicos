import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon, ShoppingBag, MapPin, Clock, CreditCard, Settings, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { useOptionsByCategory } from '@/hooks/useOptions';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  produto: z.string().min(1, 'Selecione um produto'),
  recheio: z.string().min(1, 'Selecione um recheio'),
  entrega: z.string().min(1, 'Selecione a forma de entrega'),
  statusPagamento: z.string().min(1, 'Selecione o status do pagamento'),
  quantidade: z.coerce.number().min(1, 'Quantidade deve ser pelo menos 1'),
  observacao: z.string().optional(),
  dataEntrega: z.date({ required_error: 'Selecione a data de entrega' }),
});

type FormData = z.infer<typeof formSchema>;

export function NewOrderForm() {
  const { toast } = useToast();
  
  // Buscar opções dinâmicas da API
  const { options: produtos, isLoading: loadingProdutos } = useOptionsByCategory('Produto');
  const { options: recheios, isLoading: loadingRecheios } = useOptionsByCategory('Recheio');
  const { options: entregas, isLoading: loadingEntregas } = useOptionsByCategory('Entrega');
  const { options: statusPagamentos, isLoading: loadingStatus } = useOptionsByCategory('Status Pagamento');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quantidade: 1,
      observacao: '',
    },
  });

  const onSubmit = (data: FormData) => {
    console.log('Pedido enviado:', data);
    toast({
      title: "Pedido Criado! 🍰",
      description: "Seu pedido foi registrado com sucesso!",
    });
    
    form.reset();
  };

  const isLoading = loadingProdutos || loadingRecheios || loadingEntregas || loadingStatus;

  return (
    <div className="min-h-screen bg-gradient-sweet">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="text-center flex-1">
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Thai Doces 🍰
              </h1>
              <p className="text-muted-foreground text-lg">
                Formulário de Pedido
              </p>
            </div>
            <div className="flex gap-4">
              <Link to="/dashboard">
                <Button variant="outline" size="sm" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Ver Dashboard
                </Button>
              </Link>
              <Link to="/manage-options">
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Gerenciar Opções
                </Button>
              </Link>
            </div>
          </div>

          <Card className="shadow-soft">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-foreground">Novo Pedido</CardTitle>
              <CardDescription>
                Preencha os dados do pedido
              </CardDescription>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando opções...
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    
                    {/* Produto */}
                    <FormField
                      control={form.control}
                      name="produto"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4" />
                            Produto
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background border-border">
                                <SelectValue placeholder="Selecione o produto" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {produtos.map((produto) => (
                                <SelectItem key={produto.id} value={produto.value}>
                                  {produto.value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Recheio */}
                    <FormField
                      control={form.control}
                      name="recheio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">Recheio</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background border-border">
                                <SelectValue placeholder="Selecione o recheio" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {recheios.map((recheio) => (
                                <SelectItem key={recheio.id} value={recheio.value}>
                                  {recheio.value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Entrega e Status lado a lado */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="entrega"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground font-medium flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              Entrega
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-background border-border">
                                  <SelectValue placeholder="Forma de entrega" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {entregas.map((entrega) => (
                                  <SelectItem key={entrega.id} value={entrega.value}>
                                    {entrega.value}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="statusPagamento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-foreground font-medium flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              Status Pagamento
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="bg-background border-border">
                                  <SelectValue placeholder="Status do pagamento" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {statusPagamentos.map((status) => (
                                  <SelectItem key={status.id} value={status.value}>
                                    {status.value}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Quantidade */}
                    <FormField
                      control={form.control}
                      name="quantidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">Quantidade</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              placeholder="1"
                              className="bg-background border-border"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Observação */}
                    <FormField
                      control={form.control}
                      name="observacao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">Observação</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Observações especiais para o pedido"
                              className="bg-background border-border resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Data de Entrega */}
                    <FormField
                      control={form.control}
                      name="dataEntrega"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-foreground font-medium flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Data de Entrega
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal bg-background border-border",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP", { locale: ptBR })
                                  ) : (
                                    <span>Selecione a data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className="pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Botão de Envio */}
                    <Button type="submit" className="w-full" size="lg">
                      Criar Pedido
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}