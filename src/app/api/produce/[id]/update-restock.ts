import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma'; // adjust if your prisma client path differs

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { restockThreshold } = req.body;

    if (!id || restockThreshold === undefined) {
      return res.status(400).json({ error: 'Missing id or restockThreshold' });
    }

    // Update as Float instead of Int
    const updated = await prisma.produce.update({
      where: { id: Number(id) },
      data: { restockThreshold: parseFloat(restockThreshold) },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error('Error updating restock threshold:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
