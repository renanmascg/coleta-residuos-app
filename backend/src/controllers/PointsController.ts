import { Request, Response } from 'express';
import knex from '../database/connection';

class PointsController {
  async create(request: Request, response: Response) {
    const { 
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items
     } = request.body;
  
     // Se alguma transação de salvar der erro, ele da rollback em todos os processos anteriores
     // ex: se items não existir, ele cancela o salvamento do novo point tbm dentro do banco de dados
     // trx -> convenção de nomenclatura para esse tipo de variavel
     const trx = await knex.transaction();

     const point = {
      image: 'image-fake',
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
     };
  
     const insertedIds = await trx('points').insert(point);
  
     const point_id = insertedIds[0];
  
     const pointItems = items.map((item_id:number) => {
      return {
        item_id,
        point_id
      }
     });
  
     await trx('point_items').insert(pointItems);
  
     await trx.commit();
  
     return response.json({ id: point_id , ...point,  });
  }

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const point = await knex('points').where('id', id).first();

    if(!point) {
      return response.status(400).json({ error: 'point not found.'});
    }

    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.id')
      .where('point_items.point_id', id)
      .select('items.title');

    return response.json({point, items});

  }
}

export default PointsController;