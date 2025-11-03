import { queryDB } from "./pgPool.js";

export const generateSellerId = async () => {
  const { rows } = await queryDB("SELECT nextval('seller_id_seq') AS id;");
  const nextId = rows[0].id;
  return `S${nextId}`;
};