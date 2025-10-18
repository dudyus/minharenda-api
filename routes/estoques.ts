import { PrismaClient } from '@prisma/client'
import { Router } from 'express'
import { z } from 'zod'

const prisma = new PrismaClient()

const router = Router()

const estoqueSchema = z.object({
  produto: z.string().min(2,
    { message: "Nome do estoque deve possuir, no mínimo, 2 caracteres" }),
  qtd_gramas: z.number().positive({ message: "Quantidade deve ser um valor positivo"}),
  valorTotal: z.number().positive({ message: "Valor total deve ser positivo"}),
  valorKG: z.number().positive({ message: "Valor do KG deve ser um valor positivo"}),
  valorGM: z.number().positive({ message: "Valor da Grama deve ser um valor positivo"}),
  usuarioId: z.string()
})

router.get("/", async (req, res) => {
  try {
    const estoques = await prisma.estoque.findMany()
    res.status(200).json(estoques)
  } catch (error) {
    res.status(500).json({ erro: error })
  }
})

router.post("/", async (req, res) => {

  const valida = estoqueSchema.safeParse(req.body)
  if (!valida.success) {
    res.status(400).json({ erro: valida.error })
    return
  }

  const { produto, qtd_gramas, valorTotal, valorKG, valorGM, usuarioId } = valida.data

  try {
    const estoque = await prisma.estoque.create({
      data: { produto, qtd_gramas, valorTotal, valorKG, valorGM, usuarioId }
    })
    res.status(201).json(estoque)
  } catch (error) {
    res.status(400).json({ error })
  }
})

router.put("/:id", async (req, res) => {
    const { id } = req.params
    
    const valida = estoqueSchema.safeParse(req.body)
    if (!valida.success) {
        res.status(400).json({ erro: valida.error })
        return
    }
    
    const { produto, qtd_gramas, valorTotal, valorKG, valorGM, usuarioId } = valida.data
    
    try {
        const estoque = await prisma.estoque.update({
            where: { id: Number(id) },
            data: { produto, qtd_gramas, valorTotal, valorKG, valorGM, usuarioId }
        })
    res.status(200).json(estoque)
} catch (error) {
    res.status(400).json({ error })
}
})

router.delete("/:id", async (req, res) => {
  const { id } = req.params

  try {
    const estoque = await prisma.estoque.delete({
      where: { id: Number(id) }
    })
    res.status(200).json(estoque)
  } catch (error) {
    res.status(400).json({ erro: error })
  }
})
export default router
