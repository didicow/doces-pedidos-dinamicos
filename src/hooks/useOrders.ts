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

// Variáveis do Airtable
const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const TABLE_NAME = import.meta.env.VITE_AIRTABLE_TABLE_ORDERS;

const API_BASE = `https://thai-doces-api.onrender.com/api/orders`;

// --------- FETCH: Buscar todos os pedidos ---------
const fetchOrders = async (): Promise<Order[]> => {
  console.log("🔍 Buscando pedidos do Airtable...");
  const response = await fetch(API_BASE, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  });

  console.log("Status da resposta:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Erro ao buscar pedidos:", errorText);
    throw new Error("Erro ao buscar pedidos");
  }

  const data = await response.json();
  console.log("Dados recebidos do Airtable:", data);

  // Filtra registros válidos (sem campos essenciais vazios)
  return data.records
    .filter((record: any) => record.fields.Cliente && record.fields.Produto)
    .map((record: any) => ({
      id: record.id,
      cliente: record.fields.Cliente,
      produto: record.fields.Produto,
      quantidade: record.fields.Quantidade,
      recheio: record.fields.Recheio || [],
      observacao: record.fields.Observação,
      entrega: record.fields.Entrega,
      endereco: record.fields.Endereço,
      statusPagamento: record.fields["Status Pagamento"],
      dataPedido: record.fields["Data Pedido"],
      dataEntrega: record.fields["Data Entrega"],
      valorTotal: record.fields["Valor Total (€)"],
    }));
};

// --------- MUTATION: Criar novo pedido ---------
const createOrder = async (data: CreateOrderData): Promise<Order> => {
  console.log("🚀 Enviando novo pedido para Airtable:", data);

  const payload = {
    Cliente: data.cliente,
    Produto: data.produto,
    Quantidade: Number(data.quantidade),
    Recheio: Array.isArray(data.recheio) ? data.recheio : [data.recheio],
    Observação: data.observacao || "",
    Entrega: data.entrega,
    Endereço: data.endereco || "",
    "Status Pagamento": data.statusPagamento,
    // NÃO enviar "Data Pedido" -> Airtable cria automaticamente
    "Data Entrega": new Date(data.dataEntrega).toISOString().split("T")[0],
    "Valor Total (€)": Number(data.valorTotal) || 0,
  };

  const response = await fetch(API_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields: payload }),
  });

  console.log("Status da resposta ao criar:", response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Erro ao criar pedido:", errorText);
    throw new Error("Erro ao criar pedido");
  }

  const newData = await response.json();
  console.log("Pedido criado no Airtable:", newData);

  return {
    id: newData.id,
    cliente: newData.fields.Cliente,
    produto: newData.fields.Produto,
    quantidade: newData.fields.Quantidade,
    recheio: newData.fields.Recheio || [],
    observacao: newData.fields.Observação,
    entrega: newData.fields.Entrega,
    endereco: newData.fields.Endereço,
    statusPagamento: newData.fields["Status Pagamento"],
    dataPedido: newData.fields["Data Pedido"],
    dataEntrega: newData.fields["Data Entrega"],
    valorTotal: newData.fields["Valor Total (€)"],
  };
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
