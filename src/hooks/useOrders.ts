import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./use-toast";

export interface Order {
  id: string;
  cliente: string;
  produto: string;
  quantidade: number;
  recheio: string[];
  observacao?: string;
  entrega: string;
  endereco: string;
  statusPagamento: string;
  dataPedido: string;
  dataEntrega: string;
  valorTotal: number;
}

interface CreateOrderData {
  cliente: string;
  produto: string;
  quantidade: number;
  recheio: string | string[];
  observacao?: string;
  entrega: string;
  endereco: string;
  statusPagamento: string;
  dataPedido: string;
  dataEntrega: string;
  valorTotal: number;
}

// URL da sua API no Render
const API_BASE = `${import.meta.env.VITE_API_BASE_URL}/orders`;

// --------- FETCH: Buscar todos os pedidos ---------
const fetchOrders = async (): Promise<Order[]> => {
  console.log("🔍 Buscando pedidos da API...");
  const response = await fetch(API_BASE);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Erro ao buscar pedidos:", errorText);
    throw new Error("Erro ao buscar pedidos");
  }

  const data = await response.json();
  console.log("Pedidos recebidos:", data);

  // API já retorna no formato correto
  return data;
};

// --------- MUTATION: Criar novo pedido ---------
const createOrder = async (data: CreateOrderData): Promise<Order> => {
  console.log("🚀 Enviando novo pedido para API:", data);

  const payload = {
    cliente: data.cliente,
    produto: data.produto,
    quantidade: Number(data.quantidade),
    recheio: Array.isArray(data.recheio) ? data.recheio : [data.recheio],
    observacao: data.observacao || "",
    entrega: data.entrega,
    endereco: data.endereco || "",
    statusPagamento: data.statusPagamento,
    dataPedido: data.dataPedido,
    dataEntrega: data.dataEntrega,
    valorTotal: Number(data.valorTotal) || 0,
  };

  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Erro ao criar pedido:", errorText);
    throw new Error("Erro ao criar pedido");
  }

  const newData = await response.json();
  console.log("Pedido criado:", newData);

  return newData;
};

// --------- Hook principal: Buscar todos ---------
export const useOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });
};

// --------- Hook: Criar pedido ---------
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast({
        title: "Pedido Criado! ✅",
        description: "Novo pedido foi registrado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o pedido. Tente novamente.",
        variant: "destructive",
      });
    },
  });
};
