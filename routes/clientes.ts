import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'

const prisma = new PrismaClient()
const router = Router()

const clienteSchema = z.object({
  nome: z.string().min(3, { message: "Nome deve ter no mínimo 3 caracteres" }),
  totalGasto: z.number().nonnegative({ message: "Total gasto deve ser um número positivo" }),
  numCompras: z.number().int().nonnegative({ message: "Número de compras deve ser um número inteiro positivo" }),
  tagId: z.number().int({ message: "ID da tag inválido" }),
  usuarioId: z.number().int({ message: "ID do usuário inválido" }),
})

router.get("/", async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany({
      include: {
        tag: true,
        usuario: true,
        receitas: true,
      }
    })
    res.status(200).json(clientes)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", async (req, res) => {
  const valida = clienteSchema.safeParse(req.body)
  if (!valida.success) {
    return res.status(400).json({ erro: valida.error })
  }

  const { nome, totalGasto, numCompras, tagId, usuarioId } = valida.data

  try {
    const cliente = await prisma.cliente.create({
      data: { nome, totalGasto, numCompras, tagId, usuarioId }
    })
    res.status(201).json(cliente)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

router.put("/:id", async (req, res) => {
  const { id } = req.params

  const valida = clienteSchema.safeParse(req.body)
  if (!valida.success) {
    return res.status(400).json({ erro: valida.error })
  }

  const { nome, totalGasto, numCompras, tagId, usuarioId } = valida.data

  try {
    const cliente = await prisma.cliente.update({
      where: { id: Number(id) },
      data: { nome, totalGasto, numCompras, tagId, usuarioId }
    })
    res.status(200).json(cliente)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const cliente = await prisma.cliente.delete({
      where: { id: Number(id) }
    })
    res.status(200).json(cliente)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})

export default router
