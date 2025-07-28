import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

export interface Option {
  id: string;
  category: 'Produto' | 'Recheio' | 'Entrega' | 'Status Pagamento';
  value: string;
}

interface CreateOptionData {
  category: 'Produto' | 'Recheio' | 'Entrega' | 'Status Pagamento';
  value: string;
}

// Simulação da API - substitua por suas URLs reais
const API_BASE = '/api';

const fetchOptions = async (): Promise<Option[]> => {
  // Simulação - substitua por fetch real
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: '1', category: 'Produto', value: 'Morango do Amor' },
        { id: '2', category: 'Produto', value: 'Brigadeiro' },
        { id: '3', category: 'Produto', value: 'Coxinha de Morango' },
        { id: '4', category: 'Produto', value: 'Bombom de Morango' },
        { id: '5', category: 'Produto', value: 'Pão de Mel' },
        { id: '6', category: 'Produto', value: 'Bolo de Cenoura' },
        { id: '7', category: 'Recheio', value: 'Ninho' },
        { id: '8', category: 'Recheio', value: 'Tradicional' },
        { id: '9', category: 'Recheio', value: 'Brigadeiro Branco' },
        { id: '10', category: 'Recheio', value: 'Brigadeiro Branco com Nutella' },
        { id: '11', category: 'Recheio', value: 'Brigadeiro ao Leite com Nutella' },
        { id: '12', category: 'Entrega', value: 'Retirar' },
        { id: '13', category: 'Entrega', value: 'Entregar' },
        { id: '14', category: 'Status Pagamento', value: 'Pago' },
        { id: '15', category: 'Status Pagamento', value: 'Pendente' },
      ]);
    }, 500);
  });
};

const createOption = async (data: CreateOptionData): Promise<Option> => {
  // Simulação - substitua por fetch real
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: Date.now().toString(),
        category: data.category,
        value: data.value,
      });
    }, 300);
  });
};

export const useOptions = () => {
  return useQuery({
    queryKey: ['options'],
    queryFn: fetchOptions,
  });
};

export const useCreateOption = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createOption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['options'] });
      toast({
        title: "Opção Adicionada! ✅",
        description: "Nova opção foi criada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a opção. Tente novamente.",
        variant: "destructive",
      });
    },
  });
};

export const useOptionsByCategory = (category: string) => {
  const { data: options = [], isLoading } = useOptions();
  
  const filteredOptions = options.filter(option => option.category === category);
  
  return {
    options: filteredOptions,
    isLoading,
  };
};