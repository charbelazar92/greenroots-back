import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { Prisma } from "../../generated/prisma/client.ts";
import { StatusCodes } from "http-status-codes";
import { supabase } from "../lib/supabase.ts";

import { treeBodySchema, treeUpdateSchema } from "../schemas/tree.schema.ts";


type TreeParams = { slug: string };

export function slugTransfrom(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}


export const treeController = {
  async getAllTrees(req: Request, res: Response) {
    try {
      const trees = await prisma.tree.findMany(
        {
          select: {
            id: true,
            name: true,
            price: true,
            slug: true,
            species: true,
            description: true,
            url_image: true,
            available: true,
          },
          orderBy: { id: "asc" },
        }
      );
      res.status(StatusCodes.OK).json(trees);
    } catch {

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Une erreur interne est survenue." });
    }
  },

  async getTreeBySlug(req: Request<TreeParams>, res: Response) {
    try {
      const { slug } = req.params;

      const tree = await prisma.tree.findUnique({
        where: { slug },
        select: {
          id: true,
          name: true,
          price: true,
          slug: true,
          species: true,
          description: true,
          url_image: true,
          available: true,
        },
      });

      if (!tree) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: "Arbre non trouvé" });
      }

      res.status(StatusCodes.OK).json(tree);
    } catch {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Une erreur interne est survenue." });
    }
  },

  async createTree(req: Request<TreeParams>, res: Response) {
    try {
      const result = treeBodySchema.safeParse(req.body);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: result.error.issues[0].message,
        });
      }

      const { name, price, species, description, available } = result.data;
      const imageFile = req.file;

      if (!imageFile) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: "Image manquante" });
      }

      const slug = slugTransfrom(name);

      const { error: uploadError } = await supabase.storage
        .from("tree-images")
        .upload(`${slug}.webp`, imageFile.buffer,
          { contentType: imageFile.mimetype, upsert: true });

      if (uploadError) {
        return res
          .status(StatusCodes.INTERNAL_SERVER_ERROR)
          .json({ error: "Échec de l'upload de l'image" });
      }

      const { data: publicUrlData } = supabase.storage
        .from("tree-images")
        .getPublicUrl(`${slug}.webp`);

      const newTree = await prisma.tree.create({
        data: {
          name,
          price,
          slug,
          species,
          description,
          url_image: publicUrlData.publicUrl,
          available: available === "on",
        },
      });

      return res.status(StatusCodes.CREATED).json(newTree);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return res.status(StatusCodes.CONFLICT).json({ error: "Cet arbre est déjà dans la liste" });
      }

      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Une erreur est survenue" });
    }
  },

  async updateTree(req: Request<TreeParams>, res: Response) {
    try {
      const { slug: currentSlug } = req.params;

      const result = treeUpdateSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          error: result.error.issues[0].message,
        });
      }

      const { name, price, species, description, available } = result.data;
      const imageFile = req.file;

      const existingTree = await prisma.tree.findUnique({ where: { slug: currentSlug } });

      if (!existingTree) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: "Arbre non trouvé" });
      }

      const newSlug = name ? slugTransfrom(name) : existingTree.slug;
      let urlImage = existingTree.url_image;

      if (imageFile) {
        const { error: uploadError } = await supabase.storage
          .from("tree-images")
          .upload(`${newSlug}.webp`, imageFile.buffer, {
            contentType: imageFile.mimetype, upsert: true
          });

        if (uploadError) {
          return res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: "Échec de l'upload de l'image" });
        }

        const { data: publicUrlData } = supabase.storage
          .from("tree-images")
          .getPublicUrl(`${newSlug}.webp`);

        // On ajoute un paramètre unique (timestamp) pour éviter que le navigateur
        // Affiche l'ancienne image en cache après un remplacement au même nom
        urlImage = `${publicUrlData.publicUrl}?t=${Date.now()}`;
      }

      const updatedTree = await prisma.tree.update({
        where: { slug: currentSlug },
        data: {
          name: name ?? existingTree.name,
          price: price ?? existingTree.price,
          slug: newSlug,
          species: species ?? existingTree.species,
          description: description ?? existingTree.description,
          url_image: urlImage,
          available: available === "on",
        },
      });
      return res.status(StatusCodes.OK).json(updatedTree);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return res.status(StatusCodes.NOT_FOUND).json({ error: "Arbre non trouvé" });
      }

      return res.status(StatusCodes.BAD_REQUEST).json({ error: "Une erreur est survenue" });
    }
  },


  async deleteTree(req: Request<TreeParams>, res: Response) {
    try {
      const slug: string = req.params.slug;
      await prisma.tree.delete({ where: { slug } });
      res.status(StatusCodes.NO_CONTENT).end();

    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        // P2003 : l'arbre est encore référencé par une commande (clé étrangère)
        if (error.code === "P2003") {
          res.status(StatusCodes.CONFLICT).json({
            error: "Cet arbre est lié à une ou plusieurs commandes et ne peut pas être supprimé. Passez-le en brouillon pour ne plus qu'il soit disponible.",
          });
          return;
        }

      }
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "La suppression a échoué." });
    }
  }



};