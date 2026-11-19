import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import argon2 from "argon2";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// USERS
// ---------------------------------------------------------------------------

async function seedUsers() {
  console.log("🌱 Seeding users...");

  const hashedPasswordAdmin = await argon2.hash("Admin123!");
  const hashedPasswordUser = await argon2.hash("User123!");

  const users = [
    {
      firstname: "Alice",
      lastname: "Admin",
      email: "admin@greenroots.fr",
      password: hashedPasswordAdmin,
      role: "admin" as const,
    },
    {
      firstname: "Julien",
      lastname: "Dupont",
      email: "julien.dupont@example.com",
      password: hashedPasswordUser,
      role: "user" as const,
    },
    {
      firstname: "Sofia",
      lastname: "Martin",
      email: "sofia.martin@example.com",
      password: hashedPasswordUser,
      role: "user" as const,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
  }

  console.log(`✅ ${users.length} users seeded successfully.`);
}

// ---------------------------------------------------------------------------
// TREES
// ---------------------------------------------------------------------------


const trees = [
  {
    name: "Chêne pédonculé",
    slug: "chene-pedoncule",
    species: "Quercus robur",
    price: "12.90",
    description:
      "Arbre emblématique des forêts françaises, pouvant vivre plusieurs siècles. Favorise la biodiversité locale.",
    url_image: "https://qpsahhlrtcctoviemzog.supabase.co/storage/v1/object/public/tree-images/chene-pedoncule.webp", 
    available: true,
  },
  {
    name: "Érable champêtre",
    slug: "erable-champetre",
    species: "Acer campestre",
    price: "9.50",
    description:
      "Petit érable rustique, idéal pour les haies champêtres et la stabilisation des sols.",
    url_image: "https://qpsahhlrtcctoviemzog.supabase.co/storage/v1/object/public/tree-images/erable-champetre.webp", 
    available: true,
  },
  {
    name: "Pin sylvestre",
    slug: "pin-sylvestre",
    species: "Pinus sylvestris",
    price: "14.00",
    description:
      "Conifère résistant, adapté aux sols pauvres, pilier de nombreux programmes de reboisement.",
    url_image: "https://qpsahhlrtcctoviemzog.supabase.co/storage/v1/object/public/tree-images/pin-sylvestre.webp", 
    available: true,
  },
  {
    name: "Bouleau verruqueux",
    slug: "bouleau-verruqueux",
    species: "Betula pendula",
    price: "8.90",
    description:
      "Croissance rapide, excellent pionnier pour recoloniser les sols dégradés.",
    url_image: "https://qpsahhlrtcctoviemzog.supabase.co/storage/v1/object/public/tree-images/bouleau-verruqueux.webp",
    available: true,
  },
  {
    name: "Charme commun",
    slug: "charme-commun",
    species: "Carpinus betulus",
    price: "10.50",
    description:
      "Souvent utilisé en haies, feuillage dense offrant un abri à la faune locale.",
    url_image: "https://qpsahhlrtcctoviemzog.supabase.co/storage/v1/object/public/tree-images/charme-commun.webp", 
    available: true,
  },
  {
    name: "Hêtre commun",
    slug: "hetre-commun",
    species: "Fagus sylvatica",
    price: "13.20",
    description:
      "Grand arbre forestier à croissance lente, essentiel pour les écosystèmes tempérés.",
    url_image: "https://qpsahhlrtcctoviemzog.supabase.co/storage/v1/object/public/tree-images/hetre-commun.webp", 
    available: true,
  },
  {
    name: "Tilleul à petites feuilles",
    slug: "tilleul-petites-feuilles",
    species: "Tilia cordata",
    price: "11.80",
    description:
      "Arbre mellifère très apprécié des abeilles, souvent planté en zones urbaines et rurales.",
    url_image: "https://qpsahhlrtcctoviemzog.supabase.co/storage/v1/object/public/tree-images/tilleul-petites-feuilles.webp", 
    available: true,
  },
  {
    name: "Frêne commun",
    slug: "frene-commun",
    species: "Fraxinus excelsior",
    price: "10.00",
    description:
      "Arbre à croissance rapide, bois souple traditionnellement utilisé en menuiserie.",
    url_image: "https://qpsahhlrtcctoviemzog.supabase.co/storage/v1/object/public/tree-images/frene-commun.webp", 
    available: true,
  },
  {
    name: "Noisetier commun",
    slug: "noisetier-commun",
    species: "Corylus avellana",
    price: "7.50",
    description:
      "Arbuste polyvalent, idéal en sous-bois, produit des noisettes appréciées de la faune.",
    url_image: "https://qpsahhlrtcctoviemzog.supabase.co/storage/v1/object/public/tree-images/noisetier-commun.webp", 
    available: true,
  },
  {
    name: "Aulne glutineux",
    slug: "aulne-glutineux",
    species: "Alnus glutinosa",
    price: "9.90",
    description:
      "Spécialiste des zones humides, améliore la qualité des sols grâce à la fixation d'azote.",
    url_image: "https://qpsahhlrtcctoviemzog.supabase.co/storage/v1/object/public/tree-images/aulne-glutineux.webp", 
    available: false,
  },
  {
    name: "Sorbier des oiseleurs",
    slug: "sorbier-des-oiseleurs",
    species: "Sorbus aucuparia",
    price: "11.00",
    description:
      "Petit arbre ornemental aux baies rouges très prisées par les oiseaux en hiver.",
    url_image: "https://qpsahhlrtcctoviemzog.supabase.co/storage/v1/object/public/tree-images/sorbier-des-oiseleurs.webp", 
    available: true,
  },
  {
    name: "Châtaignier commun",
    slug: "chataignier-commun",
    species: "Castanea sativa",
    price: "15.50",
    description:
      "Grand arbre productif, connu pour ses châtaignes et son bois durable.",
    url_image: "https://qpsahhlrtcctoviemzog.supabase.co/storage/v1/object/public/tree-images/chataignier-commun.webp", 
    available: false,
  },
];

async function seedTrees() {
  console.log("🌱 Seeding trees...");

  for (const tree of trees) {
    await prisma.tree.upsert({
      where: { slug: tree.slug },
      update: tree,
      create: tree,
    });
  }

  console.log(`✅ ${trees.length} trees seeded successfully.`);
}

// ---------------------------------------------------------------------------
// ORDERS + ORDER_TREES
// ---------------------------------------------------------------------------

async function seedOrders() {
  console.log("🌱 Seeding orders...");

  const julien = await prisma.user.findUniqueOrThrow({
    where: { email: "julien.dupont@example.com" },
  });
  const sofia = await prisma.user.findUniqueOrThrow({
    where: { email: "sofia.martin@example.com" },
  });

  const chene = await prisma.tree.findUniqueOrThrow({
    where: { slug: "chene-pedoncule" },
  });
  const erable = await prisma.tree.findUniqueOrThrow({
    where: { slug: "erable-champetre" },
  });
  const hetre = await prisma.tree.findUniqueOrThrow({
    where: { slug: "hetre-commun" },
  });

  const ordersToSeed = [
    {
      order_number: "CMD-2026-0001",
      user_id: julien.id,
      status: "validated" as const,
      items: [
        { tree: chene, quantity: 2 },
        { tree: erable, quantity: 1 },
      ],
    },
    {
      order_number: "CMD-2026-0002",
      user_id: sofia.id,
      status: "pending" as const,
      items: [{ tree: hetre, quantity: 3 }],
    },
    {
      order_number: "CMD-2026-0003",
      user_id: julien.id,
      status: "cancelled" as const,
      items: [{ tree: erable, quantity: 1 }],
    },
  ];

  for (const orderData of ordersToSeed) {
    const total_amount = orderData.items
      .reduce((sum, item) => sum + Number(item.tree.price) * item.quantity, 0)
      .toFixed(2);

    const order = await prisma.order.upsert({
      where: { order_number: orderData.order_number },
      update: {
        user_id: orderData.user_id,
        status: orderData.status,
        total_amount,
      },
      create: {
        order_number: orderData.order_number,
        user_id: orderData.user_id,
        status: orderData.status,
        total_amount,
      },
    });

    //on repart de zéro sur les lignes de cette commande à chaque seed
    await prisma.orderTree.deleteMany({ where: { order_id: order.id } });

    await prisma.orderTree.createMany({
      data: orderData.items.map((item) => ({
        order_id: order.id,
        tree_id: item.tree.id,
        quantity: item.quantity,
        unit_price: item.tree.price,
      })),
    });
  }

  console.log(`✅ ${ordersToSeed.length} orders seeded successfully.`);
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------

async function main() {
  await seedUsers();
  await seedTrees();
  await seedOrders();

  // Note : refresh_token n'est volontairement pas seedé.
  // Ces jetons sont générés dynamiquement à chaque connexion (login),
  // les seeder n'aurait aucune valeur de démonstration et créerait
  // de faux tokens invalides côté auth.
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
