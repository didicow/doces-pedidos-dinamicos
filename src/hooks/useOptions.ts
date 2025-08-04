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

// Variáveis do Airtable (usando ID da tabela)
const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const TABLE_ID = import.meta.env.VITE_AIRTABLE_TABLE_OPTIONS;

const API_BASE = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;

// DEBUG - Verificar se as variáveis vieram corretas do Render
console.log("🔧 Debug Airtable Options → API_KEY:", API_KEY ? "OK" : "MISSING");
console.log("🔧 Debug Airtable Options → BASE_ID:", BASE_ID);
console.log("🔧 Debug Airtable Options → TABLE_ID:", TABLE_ID);
console.log("🔧 Debug Airtable Options → API_BASE:", API_BASE);

// --------- FETCH: Buscar todas as opções ---------
const fetchOptions = async (): Promise<Option[]> => {
  const response = await fetch(API_BASE, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  });

  if (!response.ok) {
    console.error("Erro ao buscar opções:", await response.text());
    throw new Error('Erro ao buscar opções');
  }

  const data = await response.json();

  // Normaliza o formato do backend (categoria/valor) para category/value
  return data.records.map((item: any) => ({
    id: item.id,
    category: item.fields.categoria?.trim(),
    value: item.fields.valor?.trim(),
  }));
};

// --------- MUTATION: Criar nova opção ---------
const createOption = async (data: CreateOptionData): Promise<Option> => {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        categoria: data.category,
        valor: data.value,
      },
    }),
  });

  if (!response.ok) {
    console.error("Erro ao criar opção:", await response.text());
    throw new Error('Erro ao criar opção');
  }
  return response.json();
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

  // Filtra categoria normalizando case e espaços
  const filteredOptions = options.filter(
    (option) =>
      option.category?.toLowerCase().trim() === category.toLowerCase().trim()
  );

  return {
    options: filteredOptions,
    isLoading,
  };
};
