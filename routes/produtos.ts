import { PrismaClient, Unidade, Categoria_Estoque } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'

const prisma = new PrismaClient()
const router = Router()

function unidadeDisplayFromBase(u?: Unidade): 'kg' | 'L' | 'un' {
  if (u === 'G') return 'kg'
  if (u === 'ML') return 'L'
  return 'un'
}

function deriveProdutoForDisplay(p: any) {
  const unidadeBase: Unidade | undefined = p?.unidadeBase
  const custoMedio = Number(p?.custoMedio ?? 0)
  const saldoBase = Number(p?.saldoBase ?? 0)

  const unidadeDisplay = unidadeDisplayFromBase(unidadeBase)

  let precoMedioDisplay = custoMedio
  if (unidadeBase === 'G' || unidadeBase === 'ML') {
    precoMedioDisplay = custoMedio * 1000
  }
  precoMedioDisplay = Number(precoMedioDisplay.toFixed(2)) // 2 casas

  let saldoDisplay = saldoBase
  if (unidadeBase === 'G' || unidadeBase === 'ML') {
    saldoDisplay = saldoBase / 1000
    saldoDisplay = Number(saldoDisplay.toFixed(3)) // 3 casas
  }

  return {
    ...p,
    precoMedioDisplay,
    unidadeDisplay,
    saldoDisplay,
  }
}

const baseEnum = z.nativeEnum(Unidade)
const catEnum = z.nativeEnum(Categoria_Estoque)

const produtoCreateSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  unidadeBase: baseEnum,
  categoria: z.union([catEnum, z.null()]).optional(),
  anexo: z.string().url().optional(),
  data: z.coerce.date().optional(),
  usuarioId: z.string().min(1, 'usuarioId é obrigatório'),
})

const produtoUpdateSchema = z.object({
  nome: z.string().min(1).optional(),
  unidadeBase: baseEnum.optional(),
  categoria: z.union([catEnum, z.null()]).optional(),
  anexo: z.union([z.string().url(), z.null()]).optional(),
  data: z.union([z.coerce.date(), z.null()]).optional(),
  usuarioId: z.string().optional(),
  saldoBase: z.coerce.number().optional(),
  custoMedio: z.coerce.number().optional(),
})

router.get('/', async (req, res) => {
  try {
    const categoriaParam = req.query.categoria as string | undefined
    let where: any = undefined

    if (categoriaParam) {
      if (!Object.keys(Categoria_Estoque).includes(categoriaParam)) {
        res.status(400).json({ erro: 'Categoria inválida' })
        return
      }
      where = { categoria: categoriaParam as Categoria_Estoque }
    }

    const produtos = await prisma.produto.findMany({
      where,
      orderBy: { nome: 'asc' },
    })
    const withDisplay = produtos.map(deriveProdutoForDisplay)
    res.status(200).json(withDisplay)
  } catch (error) {
    res.status(500).json({ erro: 'Falha ao listar', detail: String(error) })
  }
})

router.get('/:usuarioId', async (req, res) => {
  try {
    const { usuarioId } = req.params
    const categoriaParam = req.query.categoria as string | undefined

    let where: any = { usuarioId: usuarioId }

    if (categoriaParam) {
      if (!Object.keys(Categoria_Estoque).includes(categoriaParam)) {
        return res.status(400).json({ erro: 'Categoria inválida' })
      }
      where.categoria = categoriaParam as Categoria_Estoque
    }

    const produtos = await prisma.produto.findMany({
      where,
      orderBy: { nome: 'asc' },
    })

    const withDisplay = produtos.map(deriveProdutoForDisplay)
    res.status(200).json(withDisplay)
  } catch (error) {
    res.status(500).json({ erro: 'Falha ao listar', detail: String(error) })
  }
})

router.post('/', async (req, res) => {
  const valida = produtoCreateSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error.flatten() })
    return
  }
  try {
    const produto = await prisma.produto.create({ data: valida.data })
    res.status(201).json(deriveProdutoForDisplay(produto))
  } catch (error) {
    res.status(400).json({ erro: 'Erro ao criar', detail: String(error) })
  }
})

router.put('/:id', async (req, res) => {
  const valida = produtoUpdateSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error.flatten() })
    return
  }
  try {
    const produto = await prisma.produto.update({
      where: { id: Number(req.params.id) },
      data: valida.data,
    })
    res.status(200).json(deriveProdutoForDisplay(produto))
  } catch (error) {
    res.status(400).json({ erro: 'Erro ao atualizar', detail: String(error) })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const produto = await prisma.produto.delete({ where: { id: Number(req.params.id) } })
    res.status(200).json(deriveProdutoForDisplay(produto))
  } catch (error) {
    res.status(400).json({ erro: 'Erro ao excluir', detail: String(error) })
  }
})

export default router
