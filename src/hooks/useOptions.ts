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

// Variáveis do Airtable
const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const TABLE_NAME = import.meta.env.VITE_AIRTABLE_TABLE_OPTIONS;

const API_BASE = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`;

// --------- FETCH: Buscar todas as opções ---------
const fetchOptions = async (): Promise<Option[]> => {
  const response = await fetch(API_BASE, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  });

  if (!response.ok) throw new Error('Erro ao buscar opções');

  const data = await response.json();

  // Normaliza dados do Airtable (fields.categoria / fields.valor)
  return data.records.map((record: any) => ({
    id: record.id,
    category: record.fields.Categoria?.trim(),
    value: record.fields.Valor?.trim(),
  }));
};

// --------- MUTATION: Criar nova opção ---------
const createOption = async (data: CreateOptionData): Promise<Option> => {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        categoria: data.category,
        valor: data.value,
      },
    }),
  });

  if (!response.ok) throw new Error('Erro ao criar opção');
  const newData = await response.json();

  return {
    id: newData.id,
    category: newData.fields.categoria,
    value: newData.fields.valor,
  };
};

// --------- Hook principal: Buscar todas ---------
export const useOptions = () => {
  return useQuery({
    queryKey: ['options'],
    queryFn: fetchOptions,
  });
};

// --------- Hook: Criar opção ---------
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

// --------- Hook: Buscar por categoria ---------
export const useOptionsByCategory = (category: string) => {
  const { data: options = [], isLoading } = useOptions();

  const filteredOptions = options.filter(
    (option) =>
      option.category?.toLowerCase().trim() === category.toLowerCase().trim()
  );

  return {
    options: filteredOptions,
    isLoading,
  };
};
