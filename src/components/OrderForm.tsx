import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalendarIcon, ShoppingBag, MapPin, Clock, CreditCard, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const produtos = [
  'Morango do Amor',
  'Brigadeiro',
  'Coxinha de Morango',
  'Bombom de Morango',
  'Pão de Mel',
  'Bolo de Cenoura'
] as const;

const saboresOptions = {
  'Morango do Amor': ['Branco', 'Ninho'],
  'Brigadeiro': ['Ninho', 'Tradicional', 'Brigadeiro Branco', 'Brigadeiro Branco com Nutella', 'Brigadeiro ao Leite com Nutella'],
  'Coxinha de Morango': ['Ninho', 'Tradicional', 'Brigadeiro Branco', 'Brigadeiro Branco com Nutella', 'Brigadeiro ao Leite com Nutella'],
  'Bombom de Morango': ['Ninho', 'Tradicional', 'Brigadeiro Branco', 'Brigadeiro Branco com Nutella', 'Brigadeiro ao Leite com Nutella'],
  'Pão de Mel': ['Ninho', 'Tradicional', 'Brigadeiro Branco', 'Brigadeiro Branco com Nutella', 'Brigadeiro ao Leite com Nutella'],
  'Bolo de Cenoura': ['Ninho', 'Tradicional', 'Brigadeiro Branco', 'Brigadeiro Branco com Nutella', 'Brigadeiro ao Leite com Nutella']
};

const formSchema = z.object({
  nomeCliente: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  produto: z.enum(produtos, { required_error: 'Selecione um produto' }),
  quantidade: z.coerce.number().min(1, 'Quantidade deve ser pelo menos 1'),
  valorPedido: z.coerce.number().min(0.01, 'Valor deve ser maior que zero'),
  sabores: z.array(z.string()).min(1, 'Selecione pelo menos um sabor/cobertura/recheio'),
  observacao: z.string().optional(),
  forma: z.enum(['Retirar', 'Entregar'], { required_error: 'Selecione a forma de entrega' }),
  endereco: z.string().min(5, 'Endereço deve ter pelo menos 5 caracteres'),
  statusPagamento: z.enum(['Pago', 'Pendente'], { required_error: 'Selecione o status do pagamento' }),
  dataEntrega: z.date({ required_error: 'Selecione a data de entrega' }),
  horaEntrega: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)')
});

type FormData = z.infer<typeof formSchema>;

export function OrderForm() {
  const [selectedSabores, setSelectedSabores] = useState<string[]>([]);
  const { toast } = useToast();

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

  const watchedProduto = form.watch('produto');
  const watchedForma = form.watch('forma');

  const availableSabores = watchedProduto ? saboresOptions[watchedProduto] : [];

  const onSaborChange = (sabor: string, checked: boolean) => {
    const currentSabores = form.getValues('sabores');
    let newSabores: string[];
    
    if (checked) {
      newSabores = [...currentSabores, sabor];
    } else {
      newSabores = currentSabores.filter((s) => s !== sabor);
    }
    
    setSelectedSabores(newSabores);
    form.setValue('sabores', newSabores);
  };

  const onSubmit = (data: FormData) => {
    console.log('Pedido enviado:', data);
    toast({
      title: "Pedido Enviado! 🍰",
      description: `Pedido de ${data.nomeCliente} foi registrado com sucesso!`,
    });
    
    // Reset form
    form.reset();
    setSelectedSabores([]);
  };

  const getLabelForProduct = (product: string) => {
    if (product === 'Brigadeiro') return 'Sabor';
    if (product === 'Coxinha de Morango' || product === 'Bombom de Morango') return 'Recheio/Cobertura';
    if (product === 'Morango do Amor') return 'Opção';
    return 'Cobertura';
  };

  return (
    <div className="min-h-screen bg-gradient-sweet">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Thai Doces 🍰
            </h1>
            <p className="text-muted-foreground text-lg">
              Faça seu pedido de doces artesanais
            </p>
          </div>

          <Card className="shadow-soft">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-foreground">Novo Pedido</CardTitle>
              <CardDescription>
                Preencha os dados do seu pedido com carinho
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Nome do Cliente */}
                  <FormField
                    control={form.control}
                    name="nomeCliente"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Nome do Cliente</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Digite seu nome completo" 
                            className="bg-background border-border"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Produto e Quantidade */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <SelectItem key={produto} value={produto}>
                                  {produto}
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
                  </div>

                  {/* Valor do Pedido */}
                  <FormField
                    control={form.control}
                    name="valorPedido"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Valor do Pedido
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                              R$
                            </span>
                            <Input 
                              type="number" 
                              step="0.01"
                              min="0"
                              placeholder="0,00"
                              className="bg-background border-border pl-10"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Sabores/Coberturas/Recheios */}
                  {watchedProduto && (
                    <FormField
                      control={form.control}
                      name="sabores"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">
                            {getLabelForProduct(watchedProduto)}
                          </FormLabel>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-muted/30 rounded-lg">
                            {availableSabores.map((sabor) => (
                              <div key={sabor} className="flex items-center space-x-2">
                                <Checkbox
                                  id={sabor}
                                  checked={selectedSabores.includes(sabor)}
                                  onCheckedChange={(checked) => onSaborChange(sabor, checked as boolean)}
                                />
                                <label
                                  htmlFor={sabor}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {sabor}
                                </label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Observação */}
                  <FormField
                    control={form.control}
                    name="observacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium">Observação</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Alguma observação especial para seu pedido?"
                            className="bg-background border-border resize-none"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
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
                          <MapPin className="h-4 w-4" />
                          Forma de Entrega
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background border-border">
                              <SelectValue placeholder="Como deseja receber?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Retirar">Retirar na loja</SelectItem>
                            <SelectItem value="Entregar">Entrega</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Endereço - só aparece se for entrega */}
                  {watchedForma === 'Entregar' && (
                    <FormField
                      control={form.control}
                      name="endereco"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">Endereço de Entrega</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Rua, número, bairro, cidade" 
                              className="bg-background border-border"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Data e Hora de Entrega */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                    <FormField
                      control={form.control}
                      name="horaEntrega"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground font-medium">Hora de Entrega</FormLabel>
                          <FormControl>
                            <Input 
                              type="time" 
                              className="bg-background border-border"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Status do Pagamento */}
                  <FormField
                    control={form.control}
                    name="statusPagamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground font-medium flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Status do Pagamento
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background border-border">
                              <SelectValue placeholder="Status do pagamento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Pago">Pago</SelectItem>
                            <SelectItem value="Pendente">Pendente</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Botão de Envio */}
                  <Button 
                    type="submit" 
                    variant="sweet"
                    size="lg"
                    className="w-full text-lg py-6 mt-8"
                  >
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