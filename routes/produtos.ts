import { Router } from "express";
import { PrismaClient, Unidade, Categoria_Estoque } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();
const router = Router();

// ---------- SCHEMAS ----------
const criarProdutoSchema = z.object({
  nome: z.string().min(2),
  unidadeBase: z.nativeEnum(Unidade),
  usuarioId: z.string(),
  categoria: z
    .nativeEnum(Categoria_Estoque)
    .optional()
    .nullable(),
});

const atualizarProdutoSchema = z.object({
  nome: z.string().min(2).optional(),
  categoria: z
    .nativeEnum(Categoria_Estoque)
    .optional()
    .nullable(),
  saldoBase: z.coerce.number().optional(),
  custoMedio: z.coerce.number().optional(),
  anexo: z.string().url().optional().nullable(),
  data: z.coerce.date().optional(),
  ativo: z.boolean().optional(),
});

// helper pra montar campos de display
function mapProdutoDisplay(p: any) {
  let unidadeDisplay = "un";
  let saldoDisplay = Number(p.saldoBase ?? 0);
  let precoMedioDisplay = Number(p.custoMedio ?? 0);

  if (p.unidadeBase === "G") {
    unidadeDisplay = "kg";
    saldoDisplay = +(saldoDisplay / 1000).toFixed(3);
    precoMedioDisplay = +(precoMedioDisplay * 1000).toFixed(6);
  } else if (p.unidadeBase === "ML") {
    unidadeDisplay = "L";
    saldoDisplay = +(saldoDisplay / 1000).toFixed(3);
    precoMedioDisplay = +(precoMedioDisplay * 1000).toFixed(6);
  } else {
    unidadeDisplay = "un";
  }

  return {
    ...p,
    saldoDisplay,
    unidadeDisplay,
    precoMedioDisplay,
  };
}

// ---------- ROTAS ----------

// Listar produtos do usuário (apenas ativos)
router.get("/:usuarioId", async (req, res) => {
  const { usuarioId } = req.params;

  try {
    const produtos = await prisma.produto.findMany({
      where: {
        usuarioId,
        ativo: true,
      },
      orderBy: { nome: "asc" },
    });

    const mapped = produtos.map(mapProdutoDisplay);
    res.json(mapped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao listar produtos" });
  }
});

// Criar produto
router.post("/", async (req, res) => {
  try {
    const data = criarProdutoSchema.parse(req.body);

    const criado = await prisma.produto.create({
      data: {
        nome: data.nome,
        unidadeBase: data.unidadeBase,
        usuarioId: data.usuarioId,
        categoria: data.categoria ?? null,
        saldoBase: 0,
        custoMedio: 0,
        ativo: true,
      },
    });

    res.status(201).json(mapProdutoDisplay(criado));
  } catch (err: any) {
    console.error(err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ erro: "Dados inválidos", detalhes: err.errors });
    }
    res.status(500).json({ erro: "Erro ao criar produto" });
  }
});

// Atualizar produto (inclusive saldo, custo, categoria, anexo, data, ativo)
router.put("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const body = atualizarProdutoSchema.parse(req.body);

    const data: any = {};

    if (typeof body.nome !== "undefined") data.nome = body.nome;
    if (typeof body.categoria !== "undefined") data.categoria = body.categoria;
    if (typeof body.saldoBase !== "undefined") data.saldoBase = body.saldoBase;
    if (typeof body.custoMedio !== "undefined") data.custoMedio = body.custoMedio;
    if (typeof body.anexo !== "undefined") data.anexo = body.anexo;
    if (typeof body.data !== "undefined") data.data = body.data;
    if (typeof body.ativo !== "undefined") data.ativo = body.ativo;

    const atualizado = await prisma.produto.update({
      where: { id: Number(id) },
      data,
    });

    res.json(mapProdutoDisplay(atualizado));
  } catch (err: any) {
    console.error(err);
    if (err instanceof z.ZodError) {
      return res.status(400).json({ erro: "Dados inválidos", detalhes: err.errors });
    }
    res.status(500).json({ erro: "Erro ao atualizar produto" });
  }
});

// Exclusão "hard" (opcional – ainda existe, mas o front não vai usar)
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const produto = await prisma.produto.delete({
      where: { id: Number(id) },
    });

    res.json(produto);
  } catch (err: any) {
    console.error(err);

    // se bater na FK de receitaItems, devolve erro amigável
    if (err.code === "P2003") {
      return res.status(400).json({
        erro: "Erro ao excluir",
        detail:
          "Não é possível excluir este produto porque ele já foi usado em receitas/vendas.",
      });
    }

    res.status(500).json({ erro: "Erro ao excluir produto" });
  }
});

export default router;
