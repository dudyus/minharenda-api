import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'

const prisma = new PrismaClient()

const router = Router()

const receitaSchema = z.object({
    valor: z.number().positive({ message: "Valor deve ser positivo"}),
    categoria: z.string().min(2,
        { message: "Nome da categoria deve possuir, no mínimo, 2 caracteres" }),
    usuarioId: z.string(),
    tagId: z.number().positive({ message: "ID deve ser um valor positivo"}),
    clienteId: z.number().positive({ message: "ID deve ser um valor positivo"}),
})

router.get("/", async (req, res) => {
  try {
    const receitas = await prisma.receita.findMany()
    res.status(200).json(receitas)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", async (req, res) => {

  const valida = receitaSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { valor, categoria, usuarioId, tagId, clienteId } = valida.data

  try {
    const receita = await prisma.receita.create({
      data: { valor, categoria, usuarioId, tagId, clienteId }
    })
    res.status(201).json(receita)
  } catch (error) {
    res.status(400).json({ error })
  }
})

router.put("/:id", async (req, res) => {
    const { id } = req.params
    
    const valida = receitaSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }
    
    const { valor, categoria, usuarioId, tagId, clienteId } = valida.data
    
    try {
        const receita = await prisma.receita.update({
            where: { id: Number(id) },
            data: { valor, categoria, usuarioId, tagId, clienteId }
        })
    res.status(200).json(receita)
} catch (error) {
    res.status(400).json({ error })
}
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const receita = await prisma.receita.delete({
      where: { id: Number(id) }
    })
    res.status(200).json(receita)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})
export default router
