import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";

export interface Option {
  id: string;
  category: "Produto" | "Recheio" | "Entrega" | "Status Pagamento";
  value: string;
}

interface CreateOptionData {
  category: "Produto" | "Recheio" | "Entrega" | "Status Pagamento";
  value: string;
}

// URL da API do backend
const API_BASE = `${import.meta.env.VITE_API_BASE}/options`;
// --------- FETCH: Buscar todas as opções ---------
const fetchOptions = async (): Promise<Option[]> => {
  const response = await fetch(API_BASE);

  if (!response.ok) {
    console.error("Erro ao buscar opções:", await response.text());
    throw new Error("Erro ao buscar opções");
  }

  const data = await response.json();

  // API já retorna com `category` e `value`
  return data;
};

// --------- MUTATION: Criar nova opção ---------
const createOption = async (data: CreateOptionData): Promise<Option> => {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      category: data.category,
      value: data.value,
    }),
  });

  if (!response.ok) {
    console.error("Erro ao criar opção:", await response.text());
    throw new Error("Erro ao criar opção");
  }

  return response.json();
};

// --------- Hook principal: Buscar todas ---------
export const useOptions = () => {
  return useQuery({
    queryKey: ["options"],
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
      queryClient.invalidateQueries({ queryKey: ["options"] });
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
